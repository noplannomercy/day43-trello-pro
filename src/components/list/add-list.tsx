"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface AddListProps {
  boardId: string;
  position: number;
  onListAdded: () => void;
}

export function AddList({ boardId, position, onListAdded }: AddListProps) {
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
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          boardId,
          position,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to create list");
      }

      setTitle("");
      setIsAdding(false);
      onListAdded();
      toast.success("List created");
    } catch (error) {
      console.error("Create list error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create list");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdding) {
    return (
      <Button
        onClick={() => setIsAdding(true)}
        variant="ghost"
        className="h-auto min-w-[280px] justify-start bg-white/10 hover:bg-white/20 text-white"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add a list
      </Button>
    );
  }

  return (
    <Card className="min-w-[280px] p-2">
      <form onSubmit={handleSubmit}>
        <Input
          placeholder="Enter list title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          autoFocus
          className="mb-2"
        />
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={isLoading || !title.trim()}>
            Add list
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
    </Card>
  );
}
