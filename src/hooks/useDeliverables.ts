import { useState, useEffect } from "react";
import { Deliverable } from "@/types";
import { createProjectNotifications } from "@/services/notificationService";
import { notificationConfig } from "@/config/notifications";
import { useProjectContext } from "@/contexts/ProjectContext";
import { useAuth } from './useAuth';

export function useDeliverables(projectId: string) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { project } = useProjectContext();
  const { user } = useAuth();

  const notifications = createProjectNotifications(notificationConfig);

  useEffect(() => {
    const fetchDeliverables = async () => {
      try {
        setLoading(true);
        // Simulated API call
        const mockDeliverables: Deliverable[] = [];
        setDeliverables(mockDeliverables);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch deliverables"));
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverables();
  }, [projectId]);

  const createDeliverable = async (deliverable: Omit<Deliverable, "id" | "feedback" | "revisions">) => {
    try {
      const newDeliverable: Deliverable = {
        ...deliverable,
        id: Math.random().toString(36).substr(2, 9),
        feedback: [],
        revisions: []
      };

      setDeliverables(prev => [...prev, newDeliverable]);
      if (project) {
        await notifications.onDeliverableSubmitted(project, newDeliverable);
      }
      return newDeliverable;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create deliverable"));
      throw err;
    }
  };

  const updateDeliverable = async (id: string, updates: Partial<Deliverable>) => {
    try {
      setDeliverables(prev => {
        const index = prev.findIndex(d => d.id === id);
        if (index === -1) return prev;

        const oldDeliverable = prev[index];
        const updatedDeliverable = { ...oldDeliverable, ...updates };
        const newDeliverables = [...prev];
        newDeliverables[index] = updatedDeliverable;

        if (updates.isApproved && !oldDeliverable.isApproved && project) {
          notifications.onDeliverableApproved(project, updatedDeliverable);
        }

        return newDeliverables;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update deliverable"));
      throw err;
    }
  };

  const deleteDeliverable = async (id: string) => {
    try {
      setDeliverables(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete deliverable"));
      throw err;
    }
  };

  return {
    deliverables,
    loading,
    error,
    createDeliverable,
    updateDeliverable,
    deleteDeliverable
  };
} 