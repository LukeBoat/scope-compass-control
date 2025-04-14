import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Activity as ActivityIcon, History, MessageSquare, RotateCcw, FileText, Plus, Link, Flag, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Project, Milestone, Deliverable, ScopeChange, Revision, DeliverableFeedback } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Link as RouterLink } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivityLogProps {
  project: Project;
  defaultFilter?: ActivityType;
  limit?: number;
}

type ActivityType = "all" | "milestone" | "deliverable" | "revision" | "feedback";

interface Activity {
  id: string;
  type: Exclude<ActivityType, "all">;
  title: string;
  date: string;
  description: string;
}

export function ActivityLog({ project, defaultFilter = "all", limit }: ActivityLogProps) {
  const [selectedFilter, setSelectedFilter] = useState<ActivityType>(defaultFilter);

  // Combine all activities into one sorted list
  const allActivities = useMemo<Activity[]>(() => {
    const activities: Activity[] = [
      ...project.milestones.map(m => ({
        type: "milestone" as const,
        title: m.title,
        date: m.startDate || m.dueDate || new Date().toISOString(),
        description: m.description || "",
        id: m.id
      })),
      ...project.deliverables.map(d => ({
        type: "deliverable" as const,
        title: d.name,
        date: d.dueDate || new Date().toISOString(),
        description: d.description || "",
        id: d.id
      })),
      ...(project.deliverables.flatMap(d => d.revisions || []).map(r => ({
        type: "revision" as const,
        title: "Revision",
        date: r.date,
        description: r.notes,
        id: r.id
      }))),
      ...(project.deliverables.flatMap(d => d.feedback || []).map(f => ({
        type: "feedback" as const,
        title: "Feedback",
        date: f.createdAt || new Date().toISOString(),
        description: f.content,
        id: f.id
      })))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (limit) {
      return activities.slice(0, limit);
    }
    return activities;
  }, [project, limit]);

  // Filter activities based on selected type
  const filteredActivities = useMemo(() => {
    if (selectedFilter === "all") return allActivities;
    return allActivities.filter(activity => activity.type === selectedFilter);
  }, [allActivities, selectedFilter]);

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "milestone":
        return <Flag className="h-4 w-4" />;
      case "deliverable":
        return <CheckSquare className="h-4 w-4" />;
      case "revision":
        return <History className="h-4 w-4" />;
      case "feedback":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activity Log</h3>
        <Select value={selectedFilter} onValueChange={(value: ActivityType) => setSelectedFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter activities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="milestone">Milestones</SelectItem>
            <SelectItem value="deliverable">Deliverables</SelectItem>
            <SelectItem value="revision">Revisions</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-4">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 rounded-lg border p-4">
            <div className="rounded-full bg-primary/10 p-2">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(activity.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 