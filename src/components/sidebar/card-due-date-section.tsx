"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getDueDateColor, getDueDateColorClasses } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CardDueDateSectionProps {
  cardId: string;
  dueDate: Date | null;
  onUpdate: () => void;
}

export function CardDueDateSection({
  cardId,
  dueDate,
  onUpdate,
}: CardDueDateSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelectDate = async (date: Date | undefined) => {
    if (!date) return;

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: date.toISOString() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update due date");
      }

      toast.success("Due date updated");
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Update due date error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update due date");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveDueDate = async () => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: null }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to remove due date");
      }

      toast.success("Due date removed");
      onUpdate();
    } catch (error) {
      console.error("Remove due date error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove due date");
    } finally {
      setIsUpdating(false);
    }
  };

  const dueDateObj = dueDate ? new Date(dueDate) : null;
  const color = dueDateObj ? getDueDateColor(dueDateObj) : null;
  const colorClasses = color ? getDueDateColorClasses(color) : "";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Due Date
        </h3>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" disabled={isUpdating}>
              {dueDateObj ? "Change" : "Add"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDateObj || undefined}
              onSelect={handleSelectDate}
              initialFocus
              disabled={isUpdating}
            />
          </PopoverContent>
        </Popover>
      </div>

      {dueDateObj && (
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-2 px-3 py-2 rounded", colorClasses)}>
            <CalendarIcon className="h-4 w-4" />
            <span className="font-medium">
              {format(dueDateObj, "MMMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveDueDate}
            disabled={isUpdating}
            title="Remove due date"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
