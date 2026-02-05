"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListHeader } from "./list-header";
import { AddCard } from "@/components/card/add-card";
import { CardItem } from "@/components/card/card-item";
import { List as ListType, CardWithDetails } from "@/types";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { SortableCard } from "@/components/card/sortable-card";

interface ListProps {
  list: ListType & { cards: CardWithDetails[] };
  onUpdate: () => void;
  onCardClick: (cardId: string) => void;
}

export function List({ list, onUpdate, onCardClick }: ListProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: "list",
      list,
    },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `list-${list.id}`,
    data: {
      type: "list",
      listId: list.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const cardIds = list.cards.map((card) => card.id);

  return (
    <div ref={setSortableRef} style={style} className="shrink-0">
      <Card className="w-[280px] flex flex-col max-h-[calc(100vh-200px)]">
        <div {...attributes} {...listeners}>
          <ListHeader listId={list.id} title={list.title} onUpdate={onUpdate} />
        </div>

        <div ref={setDroppableRef} className="flex-1 min-h-0">
          <ScrollArea className="h-full px-2">
            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 pb-2">
                {list.cards.map((card) => (
                  <SortableCard
                    key={card.id}
                    card={card}
                    onClick={() => onCardClick(card.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </ScrollArea>
        </div>

        <div className="p-2 border-t">
          <AddCard
            listId={list.id}
            position={list.cards.length}
            onCardAdded={onUpdate}
          />
        </div>
      </Card>
    </div>
  );
}
