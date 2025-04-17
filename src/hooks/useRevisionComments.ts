import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { RevisionComment } from '@/types';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

interface UseRevisionCommentsProps {
  revisionId: string;
}

interface UseRevisionCommentsResult {
  comments: RevisionComment[];
  loading: boolean;
  error: Error | null;
  addComment: (content: string) => Promise<void>;
}

export function useRevisionComments({ revisionId }: UseRevisionCommentsProps): UseRevisionCommentsResult {
  const [comments, setComments] = useState<RevisionComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!revisionId) return;

    setLoading(true);
    setError(null);

    // Create a query for comments on this revision
    const commentsQuery = query(
      collection(db, 'revisionComments'),
      where('revisionId', '==', revisionId),
      orderBy('createdAt', 'desc')
    );

    // Set up realtime listener
    const unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const newComments: RevisionComment[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          newComments.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
          } as RevisionComment);
        });
        setComments(newComments);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching comments:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch comments'));
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [revisionId]);

  const addComment = async (content: string): Promise<void> => {
    if (!user || !content.trim()) return;

    try {
      setError(null);

      // Extract mentioned users from content
      const mentionedUsers = content.match(/@(\w+)/g)?.map(mention => mention.slice(1)) || [];

      // Create the comment document
      const commentData = {
        revisionId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content,
        createdAt: serverTimestamp(),
        mentionedUsers
      };

      // Add to Firestore
      await addDoc(collection(db, 'revisionComments'), commentData);

      // If there are mentions, you could trigger notifications here
      if (mentionedUsers.length > 0) {
        // TODO: Implement notification system for mentions
        console.log('Mentioned users:', mentionedUsers);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err instanceof Error ? err : new Error('Failed to add comment'));
      throw err;
    }
  };

  return {
    comments,
    loading,
    error,
    addComment
  };
} 