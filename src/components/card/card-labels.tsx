"use client";

import { CardLabel } from "@/types";
import { LabelBadge } from "@/components/label/label-badge";

interface CardLabelsProps {
  labels: CardLabel[];
  maxVisible?: number;
}

export function CardLabels({ labels, maxVisible = 3 }: CardLabelsProps) {
  if (labels.length === 0) return null;

  const visibleLabels = labels.slice(0, maxVisible);
  const remainingCount = labels.length - maxVisible;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visibleLabels.map((cardLabel) => (
        <LabelBadge key={cardLabel.id} label={cardLabel.label} size="sm" />
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
