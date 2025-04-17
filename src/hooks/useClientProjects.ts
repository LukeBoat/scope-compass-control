import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ClientProject } from '@/types/client';
import { useAuth } from './useAuth';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

export function useClientProjects(clientId?: string) {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchClientProjects = async () => {
      if (!clientId || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Query projects where the client is assigned
        const projectsQuery = query(
          collection(db, 'projects'),
          where('clients', 'array-contains', clientId)
        );
        
        const querySnapshot = await getDocs(projectsQuery);
        const projectsData: ClientProject[] = [];
        
        querySnapshot.forEach((doc) => {
          projectsData.push({ id: doc.id, ...doc.data() } as ClientProject);
        });
        
        setProjects(projectsData);
      } catch (err) {
        console.error('Error fetching client projects:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch client projects'));
      } finally {
        setLoading(false);
      }
    };

    fetchClientProjects();
  }, [clientId, user]);

  const createClientProject = async (projectData: Omit<ClientProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);

      const newProject = {
        ...projectData,
        clients: [clientId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'projects'), newProject);
      const createdProject = { id: docRef.id, ...newProject } as ClientProject;
      
      setProjects(prev => [...prev, createdProject]);
      return createdProject;
    } catch (err) {
      console.error('Error creating client project:', err);
      setError(err instanceof Error ? err : new Error('Failed to create client project'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateClientProject = async (projectId: string, updates: Partial<ClientProject>) => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);

      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      setProjects(prev => 
        prev.map(project => 
          project.id === projectId ? { ...project, ...updates } : project
        )
      );
    } catch (err) {
      console.error('Error updating client project:', err);
      setError(err instanceof Error ? err : new Error('Failed to update client project'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteClientProject = async (projectId: string) => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);

      await deleteDoc(doc(db, 'projects', projectId));
      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (err) {
      console.error('Error deleting client project:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete client project'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    createClientProject,
    updateClientProject,
    deleteClientProject
  };
} 