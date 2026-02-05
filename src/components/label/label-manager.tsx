"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateLabelForm } from "./create-label-form";
import { LabelBadge } from "./label-badge";
import { Label } from "@/types";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
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

interface LabelManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  onUpdate: () => void;
}

export function LabelManager({ open, onOpenChange, boardId, onUpdate }: LabelManagerProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteLabel, setDeleteLabel] = useState<Label | null>(null);

  useEffect(() => {
    if (open) {
      fetchLabels();
    }
  }, [open, boardId]);

  const fetchLabels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/labels?boardId=${boardId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to fetch labels");
      }

      setLabels(data.data);
    } catch (error) {
      console.error("Fetch labels error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch labels");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setShowCreateForm(false);
    fetchLabels();
    onUpdate();
  };

  const handleStartEdit = (label: Label) => {
    setEditingLabel(label.id);
    setEditName(label.name);
  };

  const handleSaveEdit = async (labelId: string) => {
    if (!editName.trim()) {
      toast.error("Label name is required");
      return;
    }

    try {
      const response = await fetch(`/api/labels/${labelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update label");
      }

      toast.success("Label updated");
      setEditingLabel(null);
      fetchLabels();
      onUpdate();
    } catch (error) {
      console.error("Update label error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update label");
    }
  };

  const handleDelete = async () => {
    if (!deleteLabel) return;

    try {
      const response = await fetch(`/api/labels/${deleteLabel.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to delete label");
      }

      toast.success("Label deleted");
      setDeleteLabel(null);
      fetchLabels();
      onUpdate();
    } catch (error) {
      console.error("Delete label error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete label");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Labels</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {showCreateForm ? (
              <CreateLabelForm
                boardId={boardId}
                onSuccess={handleCreate}
                onCancel={() => setShowCreateForm(false)}
              />
            ) : (
              <>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Label
                </Button>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : labels.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No labels yet. Create one to get started.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {labels.map((label) => (
                      <div
                        key={label.id}
                        className="flex items-center gap-2 p-2 rounded border"
                      >
                        <div className="flex-1">
                          {editingLabel === label.id ? (
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveEdit(label.id);
                                } else if (e.key === "Escape") {
                                  setEditingLabel(null);
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <LabelBadge label={label} size="md" />
                          )}
                        </div>

                        <div className="flex gap-1">
                          {editingLabel === label.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(label.id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingLabel(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleStartEdit(label)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setDeleteLabel(label)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteLabel} onOpenChange={() => setDeleteLabel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Label</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this label? It will be removed from all cards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
