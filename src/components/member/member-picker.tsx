"use client";

import { useState, useEffect } from "react";
import { User, BoardMember } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MemberAvatar } from "./member-avatar";
import { UserPlus, Search } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface MemberPickerProps {
  boardId: string;
  cardId: string;
  selectedMemberIds: string[];
  onUpdate: () => void;
  onInviteClick?: () => void;
  trigger?: React.ReactNode;
}

export function MemberPicker({
  boardId,
  cardId,
  selectedMemberIds,
  onUpdate,
  onInviteClick,
  trigger,
}: MemberPickerProps) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [optimisticSelection, setOptimisticSelection] = useState<string[]>([]);

  useEffect(() => {
    setOptimisticSelection(selectedMemberIds);
  }, [selectedMemberIds]);

  useEffect(() => {
    if (!open) return;

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

    fetchMembers();
  }, [boardId, open]);

  const handleToggleMember = async (userId: string) => {
    const isCurrentlySelected = optimisticSelection.includes(userId);

    // Optimistic update
    if (isCurrentlySelected) {
      setOptimisticSelection(prev => prev.filter(id => id !== userId));
    } else {
      setOptimisticSelection(prev => [...prev, userId]);
    }

    try {
      if (isCurrentlySelected) {
        // Unassign member
        const response = await fetch(`/api/cards/${cardId}/members?userId=${userId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || "Failed to unassign member");
        }

        toast.success("Member unassigned");
      } else {
        // Assign member
        const response = await fetch(`/api/cards/${cardId}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || "Failed to assign member");
        }

        toast.success("Member assigned");
      }

      onUpdate();
    } catch (error) {
      console.error("Toggle member error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update member");

      // Rollback optimistic update
      setOptimisticSelection(selectedMemberIds);
    }
  };

  const filteredMembers = members.filter(member =>
    member.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Members
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <PopoverHeader>
          <PopoverTitle>Members</PopoverTitle>
        </PopoverHeader>

        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {searchQuery ? "No members found" : "No members yet"}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer"
                  onClick={() => handleToggleMember(member.userId)}
                >
                  <Checkbox
                    checked={optimisticSelection.includes(member.userId)}
                    onCheckedChange={() => handleToggleMember(member.userId)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {member.user && (
                    <>
                      <MemberAvatar user={member.user} size="sm" showTooltip={false} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.user.email}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {onInviteClick && (
            <>
              <div className="border-t pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setOpen(false);
                    onInviteClick();
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite member
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
