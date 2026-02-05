"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AddCardProps {
  listId: string;
  position: number;
  onCardAdded: () => void;
}

export function AddCard({ listId, position, onCardAdded }: AddCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          listId,
          position,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to create card");
      }

      setTitle("");
      onCardAdded();
      toast.success("Card created");
    } catch (error) {
      console.error("Create card error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create card");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdding) {
    return (
      <Button
        onClick={() => setIsAdding(true)}
        variant="ghost"
        size="sm"
        className="w-full justify-start"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add a card
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder="Enter card title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isLoading}
        autoFocus
        className="resize-none"
        rows={3}
      />
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={isLoading || !title.trim()}>
          Add card
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsAdding(false);
            setTitle("");
          }}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
