"use client";

import { Activity } from "@/types";
import { MemberAvatar } from "@/components/member/member-avatar";
import {
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  FileText,
  Calendar,
  Tag,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItemProps {
  activity: Activity;
}

function getActivityIcon(action: string) {
  const icons = {
    card_created: Plus,
    card_updated: Edit,
    card_deleted: Trash2,
    card_moved: ArrowRight,
    description_updated: FileText,
    due_date_set: Calendar,
    due_date_removed: Calendar,
    label_added: Tag,
    label_removed: Tag,
    member_assigned: UserPlus,
    member_unassigned: UserMinus,
  };

  return icons[action as keyof typeof icons] || Edit;
}

function getActivityDescription(activity: Activity): string {
  const details = activity.details as Record<string, any> | null;

  switch (activity.action) {
    case "card_created":
      return "created this card";
    case "card_updated":
      return "updated this card";
    case "card_deleted":
      return "deleted this card";
    case "card_moved":
      return `moved this card from ${details?.fromList || "a list"} to ${details?.toList || "another list"}`;
    case "description_updated":
      return "updated the description";
    case "due_date_set":
      return `set due date to ${details?.dueDate || "a date"}`;
    case "due_date_removed":
      return "removed the due date";
    case "label_added":
      return `added label ${details?.labelName || ""}`;
    case "label_removed":
      return `removed label ${details?.labelName || ""}`;
    case "member_assigned":
      return `assigned ${details?.memberName || "a member"}`;
    case "member_unassigned":
      return `unassigned ${details?.memberName || "a member"}`;
    default:
      return "updated this card";
  }
}

export function ActivityItem({ activity }: ActivityItemProps) {
  if (!activity.user) {
    return null;
  }

  const Icon = getActivityIcon(activity.action);
  const description = getActivityDescription(activity);
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="flex gap-3 group">
      <MemberAvatar user={activity.user} size="sm" showTooltip={true} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{" "}
              <span className="text-muted-foreground">{description}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
          </div>
          <div className="p-1 rounded bg-muted/50">
            <Icon className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
