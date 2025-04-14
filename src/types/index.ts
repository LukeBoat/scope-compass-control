
export type ProjectStatus = "Active" | "On Hold" | "Completed";
export type DeliverableStatus = "Not Started" | "In Progress" | "Delivered" | "Approved";

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  revisionLimit: number;
  revisionsUsed: number;
  progress: number;
  deliverables: Deliverable[];
}

export interface Deliverable {
  id: string;
  projectId: string;
  name: string;
  status: DeliverableStatus;
  dueDate: string;
  notes?: string;
  fileUrl?: string;
  revisions: Revision[];
}

export interface Revision {
  id: string;
  deliverableId: string;
  date: string;
  notes: string;
}
