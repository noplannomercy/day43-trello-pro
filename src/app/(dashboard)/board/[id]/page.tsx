"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { BoardHeader } from "@/components/board/board-header";
import { List } from "@/components/list/list";
import { AddList } from "@/components/list/add-list";
import { CardDetailPanel } from "@/components/sidebar/card-detail-panel";
import { InviteMemberModal } from "@/components/member/invite-member-modal";
import { BoardWithDetails, List as ListType, CardWithDetails } from "@/types";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { toast } from "sonner";
import { CardItem } from "@/components/card/card-item";

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;

  const [board, setBoard] = useState<BoardWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<CardWithDetails | null>(null);
  const [activeList, setActiveList] = useState<(ListType & { cards: CardWithDetails[] }) | null>(null);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchBoard = useCallback(async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to fetch board");
      }

      setBoard(data.data);
    } catch (error) {
      console.error("Fetch board error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch board");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [boardId, router]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === "card") {
      setActiveCard(activeData.card);
    } else if (activeData?.type === "list") {
      setActiveList(activeData.list);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !board) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Only handle card drag over
    if (activeData?.type !== "card") return;

    const activeCard = activeData.card as CardWithDetails;
    const activeListId = activeCard.listId;
    const overListId = overData?.type === "list" ? overData.listId : overData?.card?.listId;

    if (!overListId || activeListId === overListId) return;

    // Move card between lists (optimistic update)
    setBoard((prevBoard) => {
      if (!prevBoard) return prevBoard;

      const newLists = prevBoard.lists.map((list) => {
        if (list.id === activeListId) {
          return {
            ...list,
            cards: list.cards.filter((c) => c.id !== activeCard.id),
          };
        }
        if (list.id === overListId) {
          return {
            ...list,
            cards: [...list.cards, { ...activeCard, listId: overListId }],
          };
        }
        return list;
      });

      return { ...prevBoard, lists: newLists };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    setActiveList(null);

    if (!over || !board) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle list reordering
    if (activeData?.type === "list" && overData?.type === "list") {
      const oldIndex = board.lists.findIndex((l) => l.id === active.id);
      const newIndex = board.lists.findIndex((l) => l.id === over.id);

      if (oldIndex !== newIndex) {
        const newLists = arrayMove(board.lists, oldIndex, newIndex);
        setBoard({ ...board, lists: newLists });

        // Update positions in backend
        try {
          await Promise.all(
            newLists.map((list, index) =>
              fetch(`/api/lists/${list.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ position: index }),
              })
            )
          );
        } catch (error) {
          console.error("Update list positions error:", error);
          toast.error("Failed to update list positions");
          fetchBoard(); // Revert on error
        }
      }
      return;
    }

    // Handle card reordering/moving
    if (activeData?.type === "card") {
      const activeCard = activeData.card as CardWithDetails;
      const activeListId = activeCard.listId;
      const overListId = overData?.type === "list" ? overData.listId : overData?.card?.listId;

      if (!overListId) return;

      const activeList = board.lists.find((l) => l.id === activeListId);
      const overList = board.lists.find((l) => l.id === overListId);

      if (!activeList || !overList) return;

      const activeCardIndex = activeList.cards.findIndex((c) => c.id === activeCard.id);
      const overCardIndex = overData?.card
        ? overList.cards.findIndex((c) => c.id === overData.card.id)
        : overList.cards.length;

      // Same list - reorder
      if (activeListId === overListId) {
        const newCards = arrayMove(activeList.cards, activeCardIndex, overCardIndex);
        const newLists = board.lists.map((list) =>
          list.id === activeListId ? { ...list, cards: newCards } : list
        );

        setBoard({ ...board, lists: newLists });

        // Update positions
        try {
          await Promise.all(
            newCards.map((card, index) =>
              fetch(`/api/cards/${card.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ position: index }),
              })
            )
          );
        } catch (error) {
          console.error("Update card positions error:", error);
          toast.error("Failed to update card positions");
          fetchBoard();
        }
      } else {
        // Different list - move
        try {
          await fetch(`/api/cards/${activeCard.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              listId: overListId,
              position: overCardIndex,
            }),
          });

          fetchBoard();
        } catch (error) {
          console.error("Move card error:", error);
          toast.error("Failed to move card");
          fetchBoard();
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!board) {
    return null;
  }

  const backgroundStyle = board.background
    ? { backgroundColor: board.background }
    : { backgroundColor: "#0079bf" };

  const listIds = board.lists.map((list) => list.id);

  // Filter cards based on selected labels
  const filteredBoard = selectedLabelIds.length > 0
    ? {
        ...board,
        lists: board.lists.map((list) => ({
          ...list,
          cards: list.cards.filter((card: any) => {
            // Show card if it has at least one of the selected labels
            if (!card.labels || card.labels.length === 0) return false;
            return card.labels.some((cl: any) =>
              selectedLabelIds.includes(cl.labelId)
            );
          }),
        })),
      }
    : board;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]" style={backgroundStyle}>
      <BoardHeader
        boardId={board.id}
        title={board.title}
        selectedLabelIds={selectedLabelIds}
        onFilterChange={setSelectedLabelIds}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 p-4 h-full items-start">
            <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
              {filteredBoard.lists.map((list) => (
                <List
                  key={list.id}
                  list={list}
                  onUpdate={fetchBoard}
                  onCardClick={setSelectedCardId}
                />
              ))}
            </SortableContext>

            <AddList
              boardId={board.id}
              position={board.lists.length}
              onListAdded={fetchBoard}
            />
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <CardItem card={activeCard} onClick={() => {}} />
          ) : activeList ? (
            <div className="w-[280px] opacity-50">
              <List list={activeList} onUpdate={() => {}} onCardClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CardDetailPanel
        cardId={selectedCardId}
        boardId={board.id}
        onClose={() => setSelectedCardId(null)}
        onUpdate={fetchBoard}
        onInviteMember={() => setShowInviteMemberModal(true)}
      />

      <InviteMemberModal
        boardId={board.id}
        open={showInviteMemberModal}
        onOpenChange={setShowInviteMemberModal}
        onSuccess={fetchBoard}
      />
    </div>
  );
}
