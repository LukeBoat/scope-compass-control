import { useState, useEffect } from "react";
import { Project } from "@/types";
import { mockProjects } from "@/data/mockData";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        // Convert mockProjects object to array and ensure all required fields are present
        const projectsArray = Object.values(mockProjects).map(project => ({
          ...project,
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          startDate: project.startDate,
          endDate: project.endDate,
          client: project.client,
          teamMembers: project.teamMembers || [],
          milestones: project.milestones || [],
          deliverables: project.deliverables || [],
          invoices: project.invoices || [],
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        }));
        setProjects(projectsArray);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return {
    projects,
    isLoading,
    error,
    setProjects,
  };
} 