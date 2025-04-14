export type ProjectStatus = "Not Started" | "Active" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
export type DeliverableStatus = "Not Started" | "In Progress" | "Delivered" | "Approved" | "Rejected" | "In Review";
export type MilestoneVisibility = "Internal" | "Client" | "Public";
export type ScopeChangeType = "Addition" | "Removal" | "Update";
export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  client: string;
  clientName: string;
  budget: number;
  milestones: Milestone[];
  deliverables: Deliverable[];
  team: string[];
  notes: string;
  revisionLimit: number;
  revisionsUsed: number;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate?: string;
  description?: string;
  isComplete?: boolean;
  deliverables: Deliverable[];
  comments?: MilestoneComment[];
  visibility?: MilestoneVisibility;
  startDate?: string;
  order?: number;
}

export interface MilestoneComment {
  id: string;
  milestoneId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Deliverable {
  id: string;
  projectId: string;
  name: string;
  status: DeliverableStatus;
  dueDate: string;
  notes: string;
  milestoneId: string;
  isApproved: boolean;
  revisions: Revision[];
  feedback: Feedback[];
  title?: string;
  description?: string;
  assignedTo?: string;
  visibility?: MilestoneVisibility;
}

export interface DeliverableFeedback {
  id: string;
  deliverableId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  attachments?: { name: string; url: string }[];
  tags?: string[];
  createdAt: string;
}

export interface Revision {
  id: string;
  deliverableId: string;
  date: string;
  notes: string;
  fileUrl?: string;
}

export interface ScopeChange {
  id: string;
  projectId: string;
  type: ScopeChangeType;
  description: string;
  createdAt: string;
  createdBy: string;
  deliverableId?: string;
  revisionId?: string;
}

export interface Invoice {
  id: string;
  projectId: string;
  milestoneId?: string;
  createdAt: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  total: number;
  status: InvoiceStatus;
  notes?: string;
  sentAt?: string;
  paidAt?: string;
}

export interface InvoiceLineItem {
  id: string;
  label: string;
  amount: number;
  type: "deliverable" | "hours" | "fee" | "other";
  deliverableId?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
}

export interface Feedback {
  id: string;
  content: string;
  createdAt: string;
  author: string;
}
