import { useState, useEffect } from 'react';
import { Milestone, Deliverable } from '@/types';
import { useProject } from '@/contexts/ProjectContext';

// Mock data for fallback
const mockMilestones: Milestone[] = [
  {
    id: "1",
    title: "Phase 1: Design",
    dueDate: "2024-05-01",
    deliverables: [
      {
        id: "1",
        projectId: "1",
        name: "Wireframes",
        status: "In Progress",
        dueDate: "2024-04-15",
        notes: "Create wireframes for all pages",
        milestoneId: "1",
        isApproved: false,
        revisions: [],
        feedback: []
      },
      {
        id: "2",
        projectId: "1",
        name: "UI/UX Design",
        status: "Not Started",
        dueDate: "2024-04-30",
        notes: "Design user interface and experience",
        milestoneId: "1",
        isApproved: false,
        revisions: [],
        feedback: []
      },
    ],
  },
  {
    id: "2",
    title: "Phase 2: Development",
    dueDate: "2024-06-01",
    deliverables: [
      {
        id: "3",
        projectId: "1",
        name: "Frontend Implementation",
        status: "Not Started",
        dueDate: "2024-05-15",
        notes: "Implement frontend components",
        milestoneId: "2",
        isApproved: false,
        revisions: [],
        feedback: []
      },
      {
        id: "4",
        projectId: "1",
        name: "Backend Integration",
        status: "Not Started",
        dueDate: "2024-05-30",
        notes: "Integrate with backend services",
        milestoneId: "2",
        isApproved: false,
        revisions: [],
        feedback: []
      },
    ],
  },
];

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Milestone cache
const milestoneCache: Record<string, { data: Milestone[]; timestamp: number }> = {};

// This is a placeholder for the actual Firestore implementation
// In a real app, you would use the Firebase SDK here
const fetchMilestonesFromFirestore = async (projectId: string): Promise<Milestone[]> => {
  // Check cache first
  const cached = milestoneCache[projectId];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  // For now, return mock data
  // In a real implementation, this would fetch from Firestore
  const milestones = mockMilestones;
  
  // Update cache
  milestoneCache[projectId] = {
    data: milestones,
    timestamp: Date.now()
  };
  
  return milestones;
};

const createMilestoneInFirestore = async (projectId: string, milestone: Omit<Milestone, "id">): Promise<Milestone> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a new ID
  const newId = Math.random().toString(36).substr(2, 9);
  
  // Create the new milestone
  const newMilestone: Milestone = {
    ...milestone,
    id: newId,
    deliverables: milestone.deliverables || [],
  };
  
  // In a real implementation, this would save to Firestore
  return newMilestone;
};

export function useMilestones(projectId: string) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { project, updateProject } = useProject(projectId);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if project already has milestones
        if (project?.milestones?.length) {
          setMilestones(project.milestones);
          setLoading(false);
          return;
        }
        
        const fetchedMilestones = await fetchMilestonesFromFirestore(projectId);
        setMilestones(fetchedMilestones);
      } catch (err) {
        console.error("Error fetching milestones:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch milestones"));
        // Fallback to mock data
        setMilestones(mockMilestones);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [projectId, project?.milestones]);

  const createMilestone = async (milestone: Omit<Milestone, "id">) => {
    try {
      setLoading(true);
      setError(null);

      // Create new milestone with generated ID
      const newMilestone: Milestone = {
        ...milestone,
        id: `milestone-${Date.now()}`,
        deliverables: []
      };

      // Update local state
      setMilestones(prev => [...prev, newMilestone]);

      // Update project state
      if (project) {
        await updateProject({
          ...project,
          milestones: [...project.milestones, newMilestone]
        });
      }

      // Update cache
      milestoneCache[projectId] = {
        data: [...milestones, newMilestone],
        timestamp: Date.now()
      };

      return newMilestone;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create milestone"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    milestones,
    loading,
    error,
    createMilestone
  };
} 