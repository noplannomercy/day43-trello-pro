"use client";

import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CardDescription } from "./card-description";
import { CardLabelsSection } from "./card-labels-section";
import { CardDueDateSection } from "./card-due-date-section";
import { CardMembersSection } from "./card-members-section";
import { CardActivitySection } from "./card-activity-section";
import { Separator } from "@/components/ui/separator";
import { CardWithDetails } from "@/types";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CardDetailPanelProps {
  cardId: string | null;
  boardId: string;
  onClose: () => void;
  onUpdate: () => void;
  onInviteMember?: () => void;
}

export function CardDetailPanel({ cardId, boardId, onClose, onUpdate, onInviteMember }: CardDetailPanelProps) {
  const [card, setCard] = useState<CardWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!cardId) {
      setCard(null);
      return;
    }

    const fetchCard = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/cards/${cardId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || "Failed to fetch card");
        }

        setCard(data.data);
      } catch (error) {
        console.error("Fetch card error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to fetch card");
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    fetchCard();
  }, [cardId, onClose]);

  const handleDelete = async () => {
    if (!cardId) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to delete card");
      }

      toast.success("Card deleted");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Delete card error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete card");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateDescription = async (description: string) => {
    if (!cardId) return;

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update card");
      }

      setCard((prev) => prev ? { ...prev, description } : null);
      onUpdate();
      toast.success("Description updated");
    } catch (error) {
      console.error("Update card error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update card");
    }
  };

  return (
    <>
      <Sheet open={!!cardId} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : card ? (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between gap-4">
                  <SheetTitle className="flex-1">{card.title}</SheetTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <CardLabelsSection
                  cardId={card.id}
                  boardId={boardId}
                  labels={card.labels || []}
                  onUpdate={() => {
                    // Refetch card data
                    if (cardId) {
                      fetch(`/api/cards/${cardId}`)
                        .then(res => res.json())
                        .then(data => {
                          if (data.success) {
                            setCard(data.data);
                            onUpdate();
                          }
                        });
                    }
                  }}
                />

                <Separator />

                <CardDueDateSection
                  cardId={card.id}
                  dueDate={card.dueDate}
                  onUpdate={() => {
                    // Refetch card data
                    if (cardId) {
                      fetch(`/api/cards/${cardId}`)
                        .then(res => res.json())
                        .then(data => {
                          if (data.success) {
                            setCard(data.data);
                            onUpdate();
                          }
                        });
                    }
                  }}
                />

                <Separator />

                <CardMembersSection
                  cardId={card.id}
                  boardId={boardId}
                  members={card.members || []}
                  onUpdate={() => {
                    // Refetch card data
                    if (cardId) {
                      fetch(`/api/cards/${cardId}`)
                        .then(res => res.json())
                        .then(data => {
                          if (data.success) {
                            setCard(data.data);
                            onUpdate();
                          }
                        });
                    }
                  }}
                  onInviteClick={onInviteMember}
                />

                <Separator />

                <CardDescription
                  description={card.description || ""}
                  onUpdate={handleUpdateDescription}
                />

                <Separator />

                <CardActivitySection cardId={card.id} />
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
