"use client";

import { User } from "@/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MemberAvatarProps {
  user: User;
  size?: "sm" | "default" | "lg";
  showTooltip?: boolean;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function MemberAvatar({
  user,
  size = "default",
  showTooltip = true,
  className,
}: MemberAvatarProps) {
  const avatar = (
    <Avatar size={size} className={className}>
      <AvatarImage src={user.image || undefined} alt={user.name} />
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
  );

  if (!showTooltip) {
    return avatar;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{avatar}</TooltipTrigger>
        <TooltipContent>
          <p>{user.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
