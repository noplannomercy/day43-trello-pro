"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BACKGROUND_COLORS = [
  "#0079bf",
  "#d29034",
  "#519839",
  "#b04632",
  "#89609e",
  "#cd5a91",
  "#4bbf6b",
  "#00aecc",
  "#838c91",
];

export function CreateBoardModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [background, setBackground] = useState(BACKGROUND_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a board title");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), background }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to create board");
      }

      toast.success("Board created successfully");
      setOpen(false);
      setTitle("");
      setBackground(BACKGROUND_COLORS[0]);
      router.refresh();
    } catch (error) {
      console.error("Create board error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create board");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Create Board
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Board</DialogTitle>
            <DialogDescription>
              Create a new board to organize your tasks and projects.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Board Title</Label>
              <Input
                id="title"
                placeholder="e.g., Product Roadmap"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label>Background Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {BACKGROUND_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-10 rounded-md cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                    style={{ backgroundColor: color }}
                    onClick={() => setBackground(color)}
                    disabled={isLoading}
                  >
                    {background === color && (
                      <div className="flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
