"use client";

import { CardMember } from "@/types";
import { MemberAvatar } from "@/components/member/member-avatar";
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";

interface CardMembersProps {
  members: CardMember[];
  maxVisible?: number;
}

export function CardMembers({ members, maxVisible = 3 }: CardMembersProps) {
  if (!members || members.length === 0) {
    return null;
  }

  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  return (
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
  );
}
