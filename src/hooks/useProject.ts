import { useState, useCallback, useEffect } from 'react';
import { Project } from '@/types';
import { mockProjects } from '@/data/mockData';

export const useProject = (projectId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call with mock data
        const fetchedProject = mockProjects[projectId];
        if (!fetchedProject) {
          throw new Error('Project not found');
        }
        
        setProject(fetchedProject);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch project'));
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const updateProject = useCallback(async (updates: Partial<Project>) => {
    try {
      setLoading(true);
      setError(null);

      if (!project) {
        throw new Error('No project to update');
      }

      // In a real app, this would be an API call
      const updatedProject = { ...project, ...updates } as Project;
      
      // Update mock data
      mockProjects[projectId] = updatedProject;
      
      setProject(updatedProject);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update project'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [project, projectId]);

  return { project, loading, error, updateProject };
}; 