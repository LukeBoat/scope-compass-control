import { useCallback } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

interface ActivityLogData {
  actionType: 'feedback' | 'approval' | 'revision' | 'statusChange';
  projectId: string;
  deliverableId: string;
  message: string;
  metadata?: Record<string, any>;
}

export function useActivityLog() {
  const { user, isAdmin } = useAuth();

  const logActivity = useCallback(async (data: ActivityLogData) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'activityLogs'), {
        ...data,
        actorId: user.uid,
        actorName: user.displayName || user.email,
        actorRole: isAdmin ? 'admin' : 'viewer',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, [user, isAdmin]);

  const logFeedback = useCallback(async (projectId: string, deliverableId: string, content: string) => {
    await logActivity({
      actionType: 'feedback',
      projectId,
      deliverableId,
      message: `Added feedback: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
      metadata: {
        content,
        type: 'comment',
      },
    });
  }, [logActivity]);

  const logApproval = useCallback(async (projectId: string, deliverableId: string, status: string, comment?: string) => {
    await logActivity({
      actionType: 'approval',
      projectId,
      deliverableId,
      message: `Changed approval status to ${status}${comment ? `: ${comment}` : ''}`,
      metadata: {
        status,
        comment,
      },
    });
  }, [logActivity]);

  return {
    logActivity,
    logFeedback,
    logApproval,
  };
} 