"use client";

import { useState } from "react";
import { AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CardDescriptionProps {
  description: string;
  onUpdate: (description: string) => Promise<void>;
}

export function CardDescription({ description, onUpdate }: CardDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(description);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (value === description) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(value);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setValue(description);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <AlignLeft className="h-5 w-5" />
        <Label className="text-base font-semibold">Description</Label>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Add a more detailed description..."
            rows={6}
            disabled={isLoading}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={isLoading} size="sm">
              Save
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="min-h-[80px] p-3 rounded-md border cursor-pointer hover:bg-accent"
          onClick={() => setIsEditing(true)}
        >
          {description ? (
            <p className="text-sm whitespace-pre-wrap">{description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add a more detailed description...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
