"use client";

import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LabelBadge } from "@/components/label/label-badge";
import { Label } from "@/types";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { toast } from "sonner";

interface BoardFiltersProps {
  boardId: string;
  selectedLabelIds: string[];
  onFilterChange: (labelIds: string[]) => void;
}

export function BoardFilters({
  boardId,
  selectedLabelIds,
  onFilterChange,
}: BoardFiltersProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLabels();
    }
  }, [isOpen, boardId]);

  const fetchLabels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/labels?boardId=${boardId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to fetch labels");
      }

      setLabels(data.data);
    } catch (error) {
      console.error("Fetch labels error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch labels");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLabel = (labelId: string, checked: boolean) => {
    if (checked) {
      onFilterChange([...selectedLabelIds, labelId]);
    } else {
      onFilterChange(selectedLabelIds.filter((id) => id !== labelId));
    }
  };

  const handleClearFilters = () => {
    onFilterChange([]);
    setIsOpen(false);
  };

  const selectedLabels = labels.filter((l) => selectedLabelIds.includes(l.id));

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {selectedLabelIds.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1 min-w-[20px]">
                {selectedLabelIds.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Filter by Labels</h4>
              {selectedLabelIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear All
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : labels.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No labels available
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {labels.map((label) => {
                  const isSelected = selectedLabelIds.includes(label.id);

                  return (
                    <label
                      key={label.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleToggleLabel(label.id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <LabelBadge label={label} size="md" />
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selectedLabels.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedLabels.map((label) => (
            <Badge
              key={label.id}
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => handleToggleLabel(label.id, false)}
            >
              <LabelBadge label={label} size="sm" />
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
