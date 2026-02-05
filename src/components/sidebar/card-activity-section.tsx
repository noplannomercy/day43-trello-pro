"use client";

import { useState, useEffect } from "react";
import { Activity } from "@/types";
import { ActivityItem } from "@/components/activity/activity-item";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { toast } from "sonner";
import { format, isToday, isYesterday } from "date-fns";

interface CardActivitySectionProps {
  cardId: string;
}

function groupActivitiesByDate(activities: Activity[]): Record<string, Activity[]> {
  const groups: Record<string, Activity[]> = {};

  activities.forEach((activity) => {
    const date = new Date(activity.createdAt);
    let key: string;

    if (isToday(date)) {
      key = "Today";
    } else if (isYesterday(date)) {
      key = "Yesterday";
    } else {
      key = format(date, "MMMM d, yyyy");
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(activity);
  });

  return groups;
}

export function CardActivitySection({ cardId }: CardActivitySectionProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/activities?cardId=${cardId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || "Failed to fetch activities");
        }

        setActivities(data.data);
      } catch (error) {
        console.error("Fetch activities error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to fetch activities");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [cardId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold mb-3">Activity</h3>
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <div>
      <h3 className="text-sm font-semibold mb-4">Activity</h3>

      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([dateLabel, dateActivities]) => (
          <div key={dateLabel}>
            <h4 className="text-xs font-medium text-muted-foreground mb-3">
              {dateLabel}
            </h4>
            <div className="space-y-4">
              {dateActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
