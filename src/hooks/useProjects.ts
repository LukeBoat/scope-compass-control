import { useState, useEffect } from "react";
import { Project } from "@/types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProjects([]);
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