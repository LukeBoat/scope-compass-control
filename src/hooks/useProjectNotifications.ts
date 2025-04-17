import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { toast } from '@/components/ui/use-toast';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  Timestamp
} from 'firebase/firestore';

interface ProjectNotification {
  id: string;
  projectId: string;
  type: 'deliverable_added' | 'deliverable_updated' | 'milestone_completed' | 'revision_added' | 'comment_added';
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  createdAt: Timestamp;
  read: boolean;
  metadata?: Record<string, any>;
}

interface UseProjectNotificationsProps {
  projectId: string;
}

export function useProjectNotifications({ projectId }: UseProjectNotificationsProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (!projectId || !user) return;

    // Create a query for unread notifications for this project
    const notificationsQuery = query(
      collection(db, 'projectNotifications'),
      where('projectId', '==', projectId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );

    // Set up realtime listener
    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const notification = {
              id: change.doc.id,
              ...change.doc.data()
            } as ProjectNotification;

            // Don't show notifications for the current user's actions
            if (notification.userId === user.id) return;

            // Show toast based on notification type
            switch (notification.type) {
              case 'deliverable_added':
                toast({
                  title: "New Deliverable",
                  description: notification.message,
                  duration: 5000,
                  className: "bg-brand-purple/10 border-brand-purple"
                });
                break;
              case 'deliverable_updated':
                toast({
                  title: "Deliverable Updated",
                  description: notification.message,
                  duration: 5000,
                  className: "bg-brand-blue/10 border-brand-blue"
                });
                break;
              case 'milestone_completed':
                toast({
                  title: "Milestone Completed",
                  description: notification.message,
                  duration: 5000,
                  className: "bg-green-500/10 border-green-500"
                });
                break;
              case 'revision_added':
                toast({
                  title: "New Revision",
                  description: notification.message,
                  duration: 5000,
                  className: "bg-orange-500/10 border-orange-500"
                });
                break;
              case 'comment_added':
                toast({
                  title: "New Comment",
                  description: notification.message,
                  duration: 5000,
                  className: "bg-brand-purple/10 border-brand-purple"
                });
                break;
            }
          }
        });
      },
      (error) => {
        console.error('Error listening to notifications:', error);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [projectId, user]);
} 