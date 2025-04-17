import { useState, useCallback, useEffect } from 'react';
import { doc, collection, addDoc, updateDoc, serverTimestamp, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './useAuth';
import { useActivityLog } from './useActivityLog';
import { Deliverable } from '@/types';

interface UseDeliverableFeedbackProps {
  projectId: string;
  deliverableId: string;
  onDeliverableUpdate?: (deliverable: Deliverable) => void;
}

export function useDeliverableFeedback({ projectId, deliverableId, onDeliverableUpdate }: UseDeliverableFeedbackProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { logFeedback, logApproval } = useActivityLog();

  // Set up real-time listener for deliverable updates
  useEffect(() => {
    const deliverableRef = doc(db, 'projects', projectId, 'deliverables', deliverableId);
    const unsubscribe = onSnapshot(deliverableRef, (doc) => {
      if (doc.exists() && onDeliverableUpdate) {
        onDeliverableUpdate(doc.data() as Deliverable);
      }
    });

    return () => unsubscribe();
  }, [projectId, deliverableId, onDeliverableUpdate]);

  const addFeedback = useCallback(async (feedback: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add feedback',
        variant: 'destructive',
      });
      return;
    }

    if (!feedback.trim()) {
      toast({
        title: 'Error',
        description: 'Feedback cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Add feedback to the subcollection
      const feedbackRef = await addDoc(collection(db, 'projects', projectId, 'deliverables', deliverableId, 'feedback'), {
        content: feedback.trim(),
        author: user.displayName || user.email,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        status: 'pending',
        resolved: false,
        type: 'comment'
      });

      // Update the deliverable's lastUpdated timestamp
      const deliverableRef = doc(db, 'projects', projectId, 'deliverables', deliverableId);
      await updateDoc(deliverableRef, {
        lastUpdated: serverTimestamp()
      });

      // Log the activity
      await logFeedback(projectId, deliverableId, feedback);

      toast({
        title: 'Success',
        description: 'Your feedback has been successfully added.',
      });

      return feedbackRef.id;
    } catch (error) {
      console.error('Error adding feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to add feedback. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, projectId, deliverableId, toast, logFeedback]);

  const approveDeliverable = useCallback(async (comment?: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to approve deliverables',
        variant: 'destructive',
      });
      return;
    }

    if (!isAdmin) {
      toast({
        title: 'Error',
        description: 'Only administrators can approve deliverables',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const deliverableRef = doc(db, 'projects', projectId, 'deliverables', deliverableId);
      
      // Get current deliverable data for optimistic update
      const deliverableDoc = await getDoc(deliverableRef);
      const currentDeliverable = deliverableDoc.data() as Deliverable;
      
      // Optimistic update
      if (onDeliverableUpdate) {
        const optimisticUpdate: Partial<Deliverable> = {
          id: deliverableId,
          projectId,
          status: 'Approved',
          approvalStatus: 'approved',
          approvedBy: user.displayName || user.email,
          approvedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };
        onDeliverableUpdate({ ...currentDeliverable, ...optimisticUpdate });
      }
      
      // Add approval feedback if comment provided
      if (comment?.trim()) {
        await addDoc(collection(db, 'projects', projectId, 'deliverables', deliverableId, 'feedback'), {
          content: comment.trim(),
          author: user.displayName || user.email,
          authorId: user.uid,
          createdAt: serverTimestamp(),
          status: 'approved',
          resolved: true,
          type: 'approval'
        });
      }

      // Update deliverable status
      await updateDoc(deliverableRef, {
        status: 'Approved',
        approvalStatus: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: user.displayName || user.email,
        lastUpdated: serverTimestamp()
      });

      // Log the activity
      await logApproval(projectId, deliverableId, 'approved', comment);

      toast({
        title: 'Success',
        description: 'The deliverable has been successfully approved.',
      });
    } catch (error) {
      console.error('Error approving deliverable:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve deliverable. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, isAdmin, projectId, deliverableId, toast, logApproval, onDeliverableUpdate]);

  return {
    isSubmitting,
    addFeedback,
    approveDeliverable,
  };
} 