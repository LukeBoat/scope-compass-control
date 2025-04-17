import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Revision } from "@/types";

interface UseRevisionsProps {
  deliverableId: string;
}

interface UseRevisionsResult {
  revisions: Revision[];
  loading: boolean;
  error: Error | null;
  addRevision: (revision: Omit<Revision, "id" | "createdAt">) => Promise<Revision>;
  updateRevision: (revisionId: string, updates: Partial<Revision>) => Promise<void>;
}

export function useRevisions({ deliverableId }: UseRevisionsProps): UseRevisionsResult {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!deliverableId) return;

    setLoading(true);
    setError(null);

    // Create a query for revisions of this deliverable
    const revisionsQuery = query(
      collection(db, "revisions"),
      where("deliverableId", "==", deliverableId),
      orderBy("createdAt", "desc")
    );

    // Set up realtime listener
    const unsubscribe = onSnapshot(
      revisionsQuery,
      (snapshot) => {
        const newRevisions: Revision[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          newRevisions.push({
            id: doc.id,
            ...data,
            date: data.date?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
            approvedAt: data.approvedAt?.toDate(),
            rejectedAt: data.rejectedAt?.toDate(),
            markedFinalAt: data.markedFinalAt?.toDate(),
          } as Revision);
        });
        setRevisions(newRevisions);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching revisions:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch revisions"));
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [deliverableId]);

  const addRevision = async (revision: Omit<Revision, "id" | "createdAt">): Promise<Revision> => {
    try {
      setError(null);

      // Add to Firestore
      const docRef = await addDoc(collection(db, "revisions"), {
        ...revision,
        createdAt: serverTimestamp(),
      });

      // Return the newly created revision
      return {
        id: docRef.id,
        ...revision,
        createdAt: new Date(),
      };
    } catch (err) {
      console.error("Error adding revision:", err);
      setError(err instanceof Error ? err : new Error("Failed to add revision"));
      throw err;
    }
  };

  const updateRevision = async (revisionId: string, updates: Partial<Revision>): Promise<void> => {
    try {
      setError(null);

      // Update in Firestore
      const revisionRef = doc(db, "revisions", revisionId);
      await updateDoc(revisionRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error updating revision:", err);
      setError(err instanceof Error ? err : new Error("Failed to update revision"));
      throw err;
    }
  };

  return {
    revisions,
    loading,
    error,
    addRevision,
    updateRevision,
  };
} 