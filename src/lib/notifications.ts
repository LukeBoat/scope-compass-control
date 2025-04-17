import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { User } from '@/types';

interface CreateNotificationParams {
  projectId: string;
  type: 'deliverable_added' | 'deliverable_updated' | 'milestone_completed' | 'revision_added' | 'comment_added';
  user: User;
  message: string;
  metadata?: Record<string, any>;
}

export async function createProjectNotification({
  projectId,
  type,
  user,
  message,
  metadata = {}
}: CreateNotificationParams) {
  try {
    const notificationData = {
      projectId,
      type,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      message,
      createdAt: serverTimestamp(),
      read: false,
      metadata
    };

    await addDoc(collection(db, 'projectNotifications'), notificationData);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Helper functions for common notification types
export const notifications = {
  deliverableAdded: (projectId: string, user: User, deliverableName: string) => 
    createProjectNotification({
      projectId,
      type: 'deliverable_added',
      user,
      message: `${user.name} added a new deliverable: ${deliverableName}`,
      metadata: { deliverableName }
    }),

  deliverableUpdated: (projectId: string, user: User, deliverableName: string) =>
    createProjectNotification({
      projectId,
      type: 'deliverable_updated',
      user,
      message: `${user.name} updated deliverable: ${deliverableName}`,
      metadata: { deliverableName }
    }),

  milestoneCompleted: (projectId: string, user: User, milestoneName: string) =>
    createProjectNotification({
      projectId,
      type: 'milestone_completed',
      user,
      message: `${user.name} completed milestone: ${milestoneName}`,
      metadata: { milestoneName }
    }),

  revisionAdded: (projectId: string, user: User, deliverableName: string) =>
    createProjectNotification({
      projectId,
      type: 'revision_added',
      user,
      message: `${user.name} added a new revision to: ${deliverableName}`,
      metadata: { deliverableName }
    }),

  commentAdded: (projectId: string, user: User, context: string) =>
    createProjectNotification({
      projectId,
      type: 'comment_added',
      user,
      message: `${user.name} commented on: ${context}`,
      metadata: { context }
    })
}; 