"use client";

import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/types";
import { LabelBadge } from "./label-badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { toast } from "sonner";
import { Tag, Settings } from "lucide-react";

interface LabelPickerProps {
  boardId: string;
  cardId: string;
  selectedLabelIds: string[];
  onUpdate: () => void;
  onManageLabels: () => void;
  trigger?: React.ReactNode;
}

export function LabelPicker({
  boardId,
  cardId,
  selectedLabelIds,
  onUpdate,
  onManageLabels,
  trigger,
}: LabelPickerProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [updatingLabels, setUpdatingLabels] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      fetchLabels();
    }
  }, [isOpen, boardId]);

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

  const handleToggleLabel = async (labelId: string, isChecked: boolean) => {
    setUpdatingLabels((prev) => new Set(prev).add(labelId));

    try {
      if (isChecked) {
        // Add label
        const response = await fetch(`/api/cards/${cardId}/labels`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ labelId }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || "Failed to add label");
        }
      } else {
        // Remove label
        const response = await fetch(`/api/cards/${cardId}/labels?labelId=${labelId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || "Failed to remove label");
        }
      }

      onUpdate();
    } catch (error) {
      console.error("Toggle label error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update label");
    } finally {
      setUpdatingLabels((prev) => {
        const next = new Set(prev);
        next.delete(labelId);
        return next;
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Tag className="h-4 w-4 mr-2" />
            Labels
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Labels</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                onManageLabels();
              }}
            >
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : labels.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No labels available.{" "}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onManageLabels();
                }}
                className="text-primary hover:underline"
              >
                Create one
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {labels.map((label) => {
                const isSelected = selectedLabelIds.includes(label.id);
                const isUpdating = updatingLabels.has(label.id);

                return (
                  <label
                    key={label.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleToggleLabel(label.id, checked as boolean)
                      }
                      disabled={isUpdating}
                    />
                    <div className="flex-1">
                      <LabelBadge label={label} size="md" />
                    </div>
                    {isUpdating && <LoadingSpinner className="h-4 w-4" />}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
