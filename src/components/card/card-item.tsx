"use client";

import { CardWithDetails } from "@/types";
import { Card } from "@/components/ui/card";
import { CardLabels } from "./card-labels";
import { CardDueDate } from "./card-due-date";
import { CardMembers } from "./card-members";
import { FileText } from "lucide-react";

interface CardItemProps {
  card: CardWithDetails;
  onClick: () => void;
}

export function CardItem({ card, onClick }: CardItemProps) {
  const hasLabels = card.labels && card.labels.length > 0;
  const hasDueDate = !!card.dueDate;
  const hasDescription = !!card.description;
  const hasMembers = card.members && card.members.length > 0;

  return (
    <Card
      className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      {hasLabels && (
        <div className="mb-2">
          <CardLabels labels={card.labels!} maxVisible={3} />
        </div>
      )}

      <h4 className="text-sm font-medium mb-2">{card.title}</h4>

      <div className="flex items-center gap-2 flex-wrap justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {hasDueDate && <CardDueDate dueDate={new Date(card.dueDate!)} />}

          {hasDescription && (
            <div className="text-muted-foreground">
              <FileText className="h-3 w-3" />
            </div>
          )}
        </div>

        {hasMembers && (
          <CardMembers members={card.members!} maxVisible={3} />
        )}
      </div>
    </Card>
  );
}
