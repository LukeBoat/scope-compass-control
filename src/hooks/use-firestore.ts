import { useState, useEffect } from 'react';
import { Milestone, Deliverable } from '@/types';

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
        revisions: [],
      },
      {
        id: "2",
        projectId: "1",
        name: "UI/UX Design",
        status: "Not Started",
        dueDate: "2024-04-30",
        revisions: [],
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
        revisions: [],
      },
      {
        id: "4",
        projectId: "1",
        name: "Backend Integration",
        status: "Not Started",
        dueDate: "2024-05-30",
        revisions: [],
      },
    ],
  },
];

// This is a placeholder for the actual Firestore implementation
// In a real app, you would use the Firebase SDK here
const fetchMilestonesFromFirestore = async (projectId: string): Promise<Milestone[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For now, return mock data
  // In a real implementation, this would fetch from Firestore
  return mockMilestones;
};

export function useMilestones(projectId: string) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true);
        const data = await fetchMilestonesFromFirestore(projectId);
        setMilestones(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching milestones:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch milestones'));
        // Fallback to mock data on error
        setMilestones(mockMilestones);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [projectId]);

  return { milestones, loading, error };
} 