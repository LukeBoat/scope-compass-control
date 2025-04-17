import { useState, useEffect } from "react";
import { Project } from "@/types";
import { createProjectNotifications } from "@/services/notificationService";
import { notificationConfig } from "@/config/notifications";
import { mockProjects } from "@/data/mockData";

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const notifications = createProjectNotifications(notificationConfig);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        // Find project in mock data
        const mockProject = Object.values(mockProjects).find(p => p.id === projectId);
        
        if (!mockProject) {
          throw new Error("Project not found");
        }

        setProject(mockProject);
        await notifications.onProjectCreated(mockProject);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch project"));
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const updateProject = async (updates: Partial<Project>) => {
    if (!project) return;

    try {
      const oldStatus = project.status;
      const updatedProject = { ...project, ...updates };
      setProject(updatedProject);

      if (updates.status && updates.status !== oldStatus) {
        await notifications.onProjectStatusChanged(updatedProject, oldStatus);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update project"));
    }
  };

  return { project, loading, error, updateProject };
} 