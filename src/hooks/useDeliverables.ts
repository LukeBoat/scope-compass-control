import { useState, useEffect, useCallback, useMemo } from 'react';
import { Deliverable, DeliverableStatus, Revision, Feedback } from '@/types';
import { useProjectContext } from '@/contexts/ProjectContext';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Deliverables cache
const deliverablesCache: Record<string, { data: Deliverable[]; timestamp: number }> = {};

interface UseDeliverablesResult {
  deliverables: Deliverable[];
  loading: boolean;
  error: Error | null;
  addDeliverable: (deliverable: Omit<Deliverable, 'id'>) => Promise<Deliverable>;
  updateDeliverable: (id: string, updates: Partial<Deliverable>) => Promise<void>;
  deleteDeliverable: (id: string) => Promise<void>;
  updateStatus: (id: string, status: DeliverableStatus) => Promise<void>;
  addRevision: (deliverableId: string, revision: Omit<Revision, 'id'>) => Promise<void>;
  addFeedback: (deliverableId: string, feedback: Omit<Feedback, 'id'>) => Promise<void>;
}

export function useDeliverables(projectId: string): UseDeliverablesResult {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { project, updateProject } = useProjectContext();

  // Sync deliverables with project state
  useEffect(() => {
    if (project) {
      // Check cache first
      const cached = deliverablesCache[projectId];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setDeliverables(cached.data);
        setLoading(false);
        return;
      }

      setDeliverables(project.deliverables || []);
      
      // Update cache
      deliverablesCache[projectId] = {
        data: project.deliverables || [],
        timestamp: Date.now()
      };
    }
  }, [project, projectId]);

  const addDeliverable = useCallback(async (deliverable: Omit<Deliverable, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      const newDeliverable: Deliverable = {
        ...deliverable,
        id: `deliverable-${Date.now()}`,
        projectId,
        notes: deliverable.notes || '',
        milestoneId: deliverable.milestoneId || null,
        isApproved: false,
        revisions: [],
        feedback: []
      };

      // Update local state
      setDeliverables(prev => [...prev, newDeliverable]);

      // Update project state
      if (project) {
        await updateProject({
          ...project,
          deliverables: [...project.deliverables, newDeliverable]
        });
      }

      // Update cache
      deliverablesCache[projectId] = {
        data: [...deliverables, newDeliverable],
        timestamp: Date.now()
      };

      return newDeliverable;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add deliverable'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [project, projectId, deliverables, updateProject]);

  const updateDeliverable = useCallback(async (id: string, updates: Partial<Deliverable>) => {
    try {
      setLoading(true);
      setError(null);

      // Update local state
      const updatedDeliverables = deliverables.map(deliverable => 
        deliverable.id === id ? { ...deliverable, ...updates } : deliverable
      );
      setDeliverables(updatedDeliverables);

      // Update project state
      if (project) {
        await updateProject({
          ...project,
          deliverables: updatedDeliverables
        });
      }

      // Update cache
      deliverablesCache[projectId] = {
        data: updatedDeliverables,
        timestamp: Date.now()
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update deliverable'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [project, projectId, deliverables, updateProject]);

  const updateStatus = useCallback(async (id: string, status: DeliverableStatus) => {
    try {
      setLoading(true);
      setError(null);

      // Update local state
      const updatedDeliverables = deliverables.map(deliverable => 
        deliverable.id === id ? { ...deliverable, status } : deliverable
      );
      setDeliverables(updatedDeliverables);

      // Update project state
      if (project) {
        await updateProject({
          ...project,
          deliverables: updatedDeliverables
        });
      }

      // Update cache
      deliverablesCache[projectId] = {
        data: updatedDeliverables,
        timestamp: Date.now()
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update deliverable status'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [project, projectId, deliverables, updateProject]);

  const deleteDeliverable = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Update local state
      setDeliverables(prev => prev.filter(deliverable => deliverable.id !== id));

      // Update project state
      if (project) {
        await updateProject({
          ...project,
          deliverables: project.deliverables.filter(deliverable => deliverable.id !== id)
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete deliverable'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addRevision = async (deliverableId: string, revision: Omit<Revision, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      const newRevision: Revision = {
        ...revision,
        id: `revision-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      // Update local state
      setDeliverables(prev => 
        prev.map(deliverable => 
          deliverable.id === deliverableId
            ? { ...deliverable, revisions: [...deliverable.revisions, newRevision] }
            : deliverable
        )
      );

      // Update project state
      if (project) {
        await updateProject({
          ...project,
          deliverables: project.deliverables.map(deliverable =>
            deliverable.id === deliverableId
              ? { ...deliverable, revisions: [...deliverable.revisions, newRevision] }
              : deliverable
          )
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add revision'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addFeedback = async (deliverableId: string, feedback: Omit<Feedback, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      const newFeedback: Feedback = {
        ...feedback,
        id: `feedback-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      // Update local state
      setDeliverables(prev => 
        prev.map(deliverable => 
          deliverable.id === deliverableId
            ? { ...deliverable, feedback: [...deliverable.feedback, newFeedback] }
            : deliverable
        )
      );

      // Update project state
      if (project) {
        await updateProject({
          ...project,
          deliverables: project.deliverables.map(deliverable =>
            deliverable.id === deliverableId
              ? { ...deliverable, feedback: [...deliverable.feedback, newFeedback] }
              : deliverable
          )
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add feedback'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    deliverables,
    loading,
    error,
    addDeliverable,
    updateDeliverable,
    deleteDeliverable,
    updateStatus,
    addRevision,
    addFeedback
  }), [deliverables, loading, error, addDeliverable, updateDeliverable, deleteDeliverable, updateStatus, addRevision, addFeedback]);
} 