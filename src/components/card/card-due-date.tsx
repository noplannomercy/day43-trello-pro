"use client";

import { Clock } from "lucide-react";
import { format } from "date-fns";
import { getDueDateColor, getDueDateColorClasses } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface CardDueDateProps {
  dueDate: Date;
}

export function CardDueDate({ dueDate }: CardDueDateProps) {
  const color = getDueDateColor(dueDate);
  const colorClasses = getDueDateColorClasses(color);

  return (
    <div className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded", colorClasses)}>
      <Clock className="h-3 w-3" />
      <span>{format(dueDate, "MMM d")}</span>
    </div>
  );
}
