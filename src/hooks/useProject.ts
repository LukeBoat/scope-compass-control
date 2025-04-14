import { useState, useEffect } from "react";
import { Project, ProjectStatus } from "@/types";

interface UseProjectResult {
  project: Project | null;
  loading: boolean;
  error: Error | null;
  updateProject: (updates: Partial<Project>) => Promise<void>;
}

// Mock projects data store
const mockProjects: { [key: string]: Project } = {
  "1": {
    id: "1",
    name: "Website Redesign",
    description: "Complete website overhaul for modern look",
    status: "In Progress" as ProjectStatus,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    client: "TechCorp Inc",
    clientName: "TechCorp Inc",
    budget: 75000,
    milestones: [],
    deliverables: [
      {
        id: "d1",
        projectId: "1",
        name: "Homepage Design",
        status: "In Progress",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Create modern homepage design",
        milestoneId: "m1",
        isApproved: false,
        revisions: [],
        feedback: []
      },
      {
        id: "d2",
        projectId: "1",
        name: "Mobile Responsiveness",
        status: "Not Started",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Ensure website works on all devices",
        milestoneId: "m1",
        isApproved: false,
        revisions: [],
        feedback: []
      }
    ],
    team: ["u1", "u2"],
    notes: "Priority project for Q1",
    revisionLimit: 3,
    revisionsUsed: 0
  },
  "2": {
    id: "2",
    name: "Mobile App Development",
    description: "Native mobile app for iOS and Android",
    status: "In Progress" as ProjectStatus,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    client: "MobileFirst Ltd",
    clientName: "MobileFirst Ltd",
    budget: 120000,
    milestones: [],
    deliverables: [
      {
        id: "d3",
        projectId: "2",
        name: "App Architecture",
        status: "In Progress",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Design app architecture and data flow",
        milestoneId: "m2",
        isApproved: false,
        revisions: [],
        feedback: []
      },
      {
        id: "d4",
        projectId: "2",
        name: "UI Components",
        status: "Not Started",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Create reusable UI components",
        milestoneId: "m2",
        isApproved: false,
        revisions: [],
        feedback: []
      }
    ],
    team: ["u1", "u3"],
    notes: "Using React Native framework",
    revisionLimit: 5,
    revisionsUsed: 1
  }
};

export function useProject(projectId: string): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if project exists in mock data
        const mockProject = mockProjects[projectId];
        
        if (!mockProject) {
          throw new Error(`Project with ID ${projectId} not found`);
        }

        // Add mock milestones and deliverables
        mockProject.milestones = [
          {
            id: `m1-${projectId}`,
            title: "Project Setup",
            description: "Initial project setup and planning",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            isComplete: true,
            deliverables: [],
            order: 0
          },
          {
            id: `m2-${projectId}`,
            title: "Development Phase",
            description: "Main development phase",
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            isComplete: false,
            deliverables: [],
            order: 1
          }
        ];

        mockProject.deliverables = [
          {
            id: `d1-${projectId}`,
            projectId: projectId,
            name: "Project Plan",
            status: "Approved",
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            notes: "Detailed project plan and timeline",
            milestoneId: `m1-${projectId}`,
            isApproved: true,
            revisions: [],
            feedback: []
          },
          {
            id: `d2-${projectId}`,
            projectId: projectId,
            name: "Initial Design",
            status: "In Progress",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            notes: "Design mockups and wireframes",
            milestoneId: `m1-${projectId}`,
            isApproved: false,
            revisions: [],
            feedback: []
          }
        ];

        setProject(mockProject);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch project"));
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const updateProject = async (updates: Partial<Project>) => {
    try {
      setLoading(true);
      setError(null);

      if (!project) {
        throw new Error("No project to update");
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedProject = { ...project, ...updates };
      mockProjects[projectId] = updatedProject;
      setProject(updatedProject);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update project"));
    } finally {
      setLoading(false);
    }
  };

  return { project, loading, error, updateProject };
} 