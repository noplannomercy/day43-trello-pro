"use client";

import { useState, useEffect } from "react";
import { BoardMember } from "@/types";
import { MemberAvatar } from "@/components/member/member-avatar";
import { InviteMemberModal } from "@/components/member/invite-member-modal";
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface BoardMembersProps {
  boardId: string;
  maxVisible?: number;
}

export function BoardMembers({ boardId, maxVisible = 5 }: BoardMembersProps) {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/boards/${boardId}/members`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to fetch members");
      }

      setMembers(data.data);
    } catch (error) {
      console.error("Fetch members error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [boardId]);

  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  return (
    <>
      <div className="flex items-center gap-2">
        {members.length > 0 && (
          <AvatarGroup>
            {visibleMembers.map((member) => (
              member.user && (
                <MemberAvatar
                  key={member.id}
                  user={member.user}
                  size="sm"
                  showTooltip={true}
                />
              )
            ))}
            {remainingCount > 0 && (
              <AvatarGroupCount>+{remainingCount}</AvatarGroupCount>
            )}
          </AvatarGroup>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite
        </Button>
      </div>

      <InviteMemberModal
        boardId={boardId}
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onSuccess={fetchMembers}
      />
    </>
  );
}
