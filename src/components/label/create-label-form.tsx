"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LABEL_COLORS, getLabelColorClass } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CreateLabelFormProps {
  boardId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateLabelForm({ boardId, onSuccess, onCancel }: CreateLabelFormProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(LABEL_COLORS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Label name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          color: selectedColor,
          boardId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to create label");
      }

      toast.success("Label created");
      onSuccess();
    } catch (error) {
      console.error("Create label error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create label");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label-name">Name</Label>
        <Input
          id="label-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter label name"
          maxLength={50}
          disabled={isSubmitting}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="grid grid-cols-5 gap-2">
          {LABEL_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setSelectedColor(color.value)}
              className={cn(
                "h-8 rounded transition-transform hover:scale-110",
                getLabelColorClass(color.value),
                selectedColor === color.value && "ring-2 ring-offset-2 ring-primary"
              )}
              title={color.name}
              disabled={isSubmitting}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create"}
        </Button>
      </div>
    </form>
  );
}
