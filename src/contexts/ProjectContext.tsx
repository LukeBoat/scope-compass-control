import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useProject } from '@/hooks/useProject';
import { Project } from '@/types';

interface ProjectContextType {
  project: Project | null;
  loading: boolean;
  error: Error | null;
  updateProject: (updates: Partial<Project>) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  projectId: string;
  children: React.ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ projectId, children }) => {
  const { project, loading, error, updateProject } = useProject(projectId);

  const value = useMemo(() => ({
    project,
    loading,
    error,
    updateProject
  }), [project, loading, error, updateProject]);

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}; 