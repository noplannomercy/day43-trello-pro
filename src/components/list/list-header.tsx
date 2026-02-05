"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";

interface ListHeaderProps {
  listId: string;
  title: string;
  onUpdate: () => void;
}

export function ListHeader({ listId, title, onUpdate }: ListHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!editedTitle.trim() || editedTitle === title) {
      setIsEditing(false);
      setEditedTitle(title);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editedTitle.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update list");
      }

      setIsEditing(false);
      onUpdate();
      toast.success("List updated");
    } catch (error) {
      console.error("Update list error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update list");
      setEditedTitle(title);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to delete list");
      }

      onUpdate();
      toast.success("List deleted");
    } catch (error) {
      console.error("Delete list error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete list");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-2 gap-2">
        {isEditing ? (
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleUpdate}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUpdate();
              } else if (e.key === "Escape") {
                setIsEditing(false);
                setEditedTitle(title);
              }
            }}
            disabled={isLoading}
            autoFocus
            className="font-semibold"
          />
        ) : (
          <h3
            className="font-semibold px-2 flex-1 cursor-pointer hover:bg-accent rounded"
            onClick={() => setIsEditing(true)}
          >
            {title}
          </h3>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? All cards in this list will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
