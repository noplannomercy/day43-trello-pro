"use client";

import { CardMember } from "@/types";
import { MemberAvatar } from "@/components/member/member-avatar";
import { MemberPicker } from "@/components/member/member-picker";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

interface CardMembersSectionProps {
  cardId: string;
  boardId: string;
  members: CardMember[];
  onUpdate: () => void;
  onInviteClick?: () => void;
}

export function CardMembersSection({
  cardId,
  boardId,
  members,
  onUpdate,
  onInviteClick,
}: CardMembersSectionProps) {
  const handleRemoveMember = async (userId: string) => {
    try {
      const response = await fetch(`/api/cards/${cardId}/members?userId=${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to remove member");
      }

      toast.success("Member removed");
      onUpdate();
    } catch (error) {
      console.error("Remove member error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Members</h3>
        <MemberPicker
          boardId={boardId}
          cardId={cardId}
          selectedMemberIds={members.map(m => m.userId)}
          onUpdate={onUpdate}
          onInviteClick={onInviteClick}
        />
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">No members assigned</p>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            member.user && (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-accent group"
              >
                <MemberAvatar user={member.user} size="sm" showTooltip={false} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.user.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveMember(member.userId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
