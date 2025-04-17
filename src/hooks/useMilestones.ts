import { useState, useEffect } from "react";
import { Milestone } from "@/types";
import { createProjectNotifications } from "@/services/notificationService";
import { notificationConfig } from "@/config/notifications";

export function useMilestones(projectId: string) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const notifications = createProjectNotifications(notificationConfig);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true);
        // Simulated API call
        const mockMilestones: Milestone[] = [];
        setMilestones(mockMilestones);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch milestones"));
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [projectId]);

  const createMilestone = async (milestone: Omit<Milestone, "id" | "deliverables" | "comments">) => {
    try {
      const newMilestone: Milestone = {
        ...milestone,
        id: Math.random().toString(36).substr(2, 9),
        deliverables: [],
        comments: []
      };

      setMilestones(prev => [...prev, newMilestone]);
      await notifications.onMilestoneCreated({ id: projectId } as any, newMilestone);
      return newMilestone;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create milestone"));
      throw err;
    }
  };

  const updateMilestone = async (id: string, updates: Partial<Milestone>) => {
    try {
      setMilestones(prev => {
        const index = prev.findIndex(m => m.id === id);
        if (index === -1) return prev;

        const oldMilestone = prev[index];
        const updatedMilestone = { ...oldMilestone, ...updates };
        const newMilestones = [...prev];
        newMilestones[index] = updatedMilestone;

        if (updates.isComplete && !oldMilestone.isComplete) {
          notifications.onMilestoneCompleted({ id: projectId } as any, updatedMilestone);
        }

        return newMilestones;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update milestone"));
      throw err;
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      setMilestones(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete milestone"));
      throw err;
    }
  };

  return {
    milestones,
    loading,
    error,
    createMilestone,
    updateMilestone,
    deleteMilestone
  };
} 