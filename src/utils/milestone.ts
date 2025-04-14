import { Deliverable, Milestone } from "@/types";

export function calculateMilestoneProgress(deliverables: Deliverable[]): number {
  if (!deliverables.length) return 0;
  
  const completedDeliverables = deliverables.filter(
    d => d.status === "Approved" || d.status === "Delivered"
  );
  
  return Math.round((completedDeliverables.length / deliverables.length) * 100);
}

export function sortMilestonesByDate(milestones: Milestone[]): Milestone[] {
  return [...milestones].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return dateA - dateB;
  });
}

export function filterMilestonesByStatus(
  milestones: Milestone[],
  status?: "completed" | "in-progress" | "upcoming"
): Milestone[] {
  if (!status) return milestones;
  
  const now = new Date().getTime();
  
  return milestones.filter(milestone => {
    const dueDate = new Date(milestone.dueDate).getTime();
    const isCompleted = milestone.deliverables?.every(
      d => d.status === "Approved" || d.status === "Delivered"
    );
    
    switch (status) {
      case "completed":
        return isCompleted;
      case "in-progress":
        return !isCompleted && dueDate >= now;
      case "upcoming":
        return !isCompleted && dueDate > now;
      default:
        return true;
    }
  });
}

export function searchMilestones(
  milestones: Milestone[],
  query: string
): Milestone[] {
  const searchTerm = query.toLowerCase();
  return milestones.filter(milestone => 
    milestone.title.toLowerCase().includes(searchTerm) ||
    milestone.description?.toLowerCase().includes(searchTerm) ||
    milestone.deliverables.some(deliverable => 
      deliverable.name.toLowerCase().includes(searchTerm) ||
      deliverable.description?.toLowerCase().includes(searchTerm)
    )
  );
} 