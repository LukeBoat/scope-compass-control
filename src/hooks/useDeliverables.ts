import { useState, useCallback } from 'react';
import { Deliverable, DeliverableStatus, Revision } from '@/types';

interface UseDeliverablesResult {
  deliverables: Deliverable[];
  loading: boolean;
  error: Error | null;
  addDeliverable: (deliverable: Omit<Deliverable, 'id'>) => Promise<void>;
  updateDeliverable: (id: string, updates: Partial<Deliverable>) => Promise<void>;
  deleteDeliverable: (id: string) => Promise<void>;
  updateStatus: (id: string, status: "Not Started" | "In Progress" | "Completed") => Promise<void>;
  addFeedback: (id: string, feedback: string) => Promise<void>;
  addRevision: (id: string, revisionData: { description: string; notes: string }) => Promise<void>;
}

export function useDeliverables(projectId: string): UseDeliverablesResult {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Add a new deliverable
  const addDeliverable = useCallback(async (deliverable: Omit<Deliverable, 'id'>) => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newDeliverable: Deliverable = {
        ...deliverable,
        id: `del_${Date.now()}`,
        projectId,
        revisions: [],
        feedback: [],
        isApproved: false,
      };

      setDeliverables(prev => [...prev, newDeliverable]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add deliverable'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Update an existing deliverable
  const updateDeliverable = useCallback(async (id: string, updates: Partial<Deliverable>) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      setDeliverables(prev => prev.map(d => 
        d.id === id ? { ...d, ...updates } : d
      ));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update deliverable'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a deliverable
  const deleteDeliverable = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      setDeliverables(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete deliverable'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update deliverable status
  const updateStatus = useCallback(async (id: string, status: "Not Started" | "In Progress" | "Completed") => {
    try {
      await updateDeliverable(id, { status });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update status'));
      throw err;
    }
  }, [updateDeliverable]);

  // Add feedback to a deliverable
  const addFeedback = useCallback(async (id: string, feedback: string) => {
    try {
      const deliverable = deliverables.find(d => d.id === id);
      if (!deliverable) throw new Error('Deliverable not found');

      await updateDeliverable(id, {
        feedback: [...deliverable.feedback, feedback]
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add feedback'));
      throw err;
    }
  }, [deliverables, updateDeliverable]);

  // Add a revision to a deliverable
  const addRevision = useCallback(async (id: string, revisionData: { description: string; notes: string }) => {
    try {
      const deliverable = deliverables.find(d => d.id === id);
      if (!deliverable) throw new Error('Deliverable not found');

      const newRevision: Revision = {
        id: `rev_${Date.now()}`,
        deliverableId: id,
        date: new Date().toISOString(),
        ...revisionData,
      };

      await updateDeliverable(id, {
        revisions: [...deliverable.revisions, newRevision]
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add revision'));
      throw err;
    }
  }, [deliverables, updateDeliverable]);

  return {
    deliverables,
    loading,
    error,
    addDeliverable,
    updateDeliverable,
    deleteDeliverable,
    updateStatus,
    addFeedback,
    addRevision
  };
} 