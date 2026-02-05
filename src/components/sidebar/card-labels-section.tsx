"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabelBadge } from "@/components/label/label-badge";
import { LabelPicker } from "@/components/label/label-picker";
import { LabelManager } from "@/components/label/label-manager";
import { CardLabel } from "@/types";
import { toast } from "sonner";

interface CardLabelsSectionProps {
  cardId: string;
  boardId: string;
  labels: CardLabel[];
  onUpdate: () => void;
}

export function CardLabelsSection({
  cardId,
  boardId,
  labels,
  onUpdate,
}: CardLabelsSectionProps) {
  const [showLabelManager, setShowLabelManager] = useState(false);

  const handleRemoveLabel = async (labelId: string) => {
    try {
      const response = await fetch(`/api/cards/${cardId}/labels?labelId=${labelId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to remove label");
      }

      toast.success("Label removed");
      onUpdate();
    } catch (error) {
      console.error("Remove label error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove label");
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Labels
          </h3>
          <LabelPicker
            boardId={boardId}
            cardId={cardId}
            selectedLabelIds={labels.map((cl) => cl.labelId)}
            onUpdate={onUpdate}
            onManageLabels={() => setShowLabelManager(true)}
          />
        </div>

        {labels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {labels.map((cardLabel) => (
              <LabelBadge
                key={cardLabel.id}
                label={cardLabel.label}
                size="md"
                showRemove
                onRemove={() => handleRemoveLabel(cardLabel.labelId)}
              />
            ))}
          </div>
        )}
      </div>

      <LabelManager
        open={showLabelManager}
        onOpenChange={setShowLabelManager}
        boardId={boardId}
        onUpdate={onUpdate}
      />
    </>
  );
}
