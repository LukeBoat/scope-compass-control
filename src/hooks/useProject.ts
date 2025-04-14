import { useState, useEffect } from "react";
import { Project, ProjectStatus } from "@/types";

interface UseProjectResult {
  project: Project | null;
  loading: boolean;
  error: Error | null;
  updateProject: (updates: Partial<Project>) => Promise<void>;
}

export function useProject(projectId: string): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual Firestore fetch
        // For now, using mock data
        const mockProject: Project = {
          id: projectId,
          name: "Sample Project",
          description: "A sample project for testing",
          status: "In Progress" as ProjectStatus,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          client: "Sample Client",
          budget: 50000,
          milestones: [
            {
              id: "m1",
              title: "Project Setup",
              description: "Initial project setup and planning",
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              isComplete: true,
              deliverables: [],
              order: 0
            },
            {
              id: "m2",
              title: "Development Phase",
              description: "Main development phase",
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              isComplete: false,
              deliverables: [],
              order: 1
            }
          ],
          deliverables: [
            {
              id: "d1",
              projectId: projectId,
              name: "Project Plan",
              status: "Approved",
              dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              notes: "Detailed project plan and timeline",
              milestoneId: "m1",
              isApproved: true,
              revisions: [],
              feedback: []
            },
            {
              id: "d2",
              projectId: projectId,
              name: "Initial Design",
              status: "Approved",
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              notes: "Design mockups and wireframes",
              milestoneId: "m1",
              isApproved: true,
              revisions: [],
              feedback: []
            },
            {
              id: "d3",
              projectId: projectId,
              name: "Core Features",
              status: "In Progress",
              dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
              notes: "Implementation of core features",
              milestoneId: "m2",
              isApproved: false,
              revisions: [],
              feedback: []
            }
          ],
          team: ["u1", "u2"],
          notes: "This is a sample project with mock data for testing the invoice system."
        };

        setProject(mockProject);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch project"));
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const updateProject = async (updates: Partial<Project>) => {
    try {
      setLoading(true);
      // TODO: Replace with actual Firestore update
      // For now, just update the local state
      if (project) {
        const updatedProject = { ...project, ...updates };
        setProject(updatedProject);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update project"));
    } finally {
      setLoading(false);
    }
  };

  return { project, loading, error, updateProject };
} 