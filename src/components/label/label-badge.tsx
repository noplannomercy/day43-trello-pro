"use client";

import { Label } from "@/types";
import { getLabelColorClass } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface LabelBadgeProps {
  label: Label;
  showRemove?: boolean;
  onRemove?: () => void;
  size?: "sm" | "md";
}

export function LabelBadge({ label, showRemove, onRemove, size = "sm" }: LabelBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded text-white font-medium",
        getLabelColorClass(label.color),
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <span className="truncate max-w-[120px]">{label.name}</span>
      {showRemove && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-black/20 rounded-full p-0.5 transition-colors"
          aria-label={`Remove ${label.name} label`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
