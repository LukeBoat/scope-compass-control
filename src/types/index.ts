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
  budget: number;
  client: string;
  clients: string[];
  teamMembers: {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'editor' | 'viewer';
    avatar?: string;
    status: 'active' | 'pending';
  }[];
  deliverables: Deliverable[];
  milestones: Milestone[];
  invoices: Invoice[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
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
  status: "Not Started" | "In Progress" | "Delivered" | "Approved" | "Rejected" | "In Review";
  dueDate: string;
  notes?: string;
  milestoneId: string;
  isApproved: boolean;
  revisions: Revision[];
  feedback: Feedback[];
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  clientNotes?: string;
  title?: string;
  description?: string;
  assignedTo?: string;
  visibility: "Internal" | "Client" | "Public";
  fileUrl?: string;
  lastUpdated?: string;
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

export interface RevisionComment {
  id: string;
  revisionId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Revision {
  id: string;
  deliverableId: string;
  version: string;
  status: "pending" | "approved" | "rejected" | "final";
  date: Date;
  changes: string;
  files: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  markedFinalBy?: string;
  markedFinalAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
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
  projectName: string;
  clientName: string;
  total: number;
  currency: string;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
  lineItems: LineItem[];
  notes?: string;
  paymentInstructions?: string;
  termsAndConditions?: string;
  isRecurring?: boolean;
  recurringInterval?: string;
  sentAt?: string;
}

export interface LineItem {
  id: string;
  label: string;
  description?: string;
  amount: number;
}

export interface Feedback {
  id: string;
  author: string;
  role: "admin" | "client";
  content: string;
  timestamp: string;
  type: "comment" | "question" | "requestChange";
}

export interface ExtendedFeedback extends Feedback {
  authorDetails: {
    id: string;
    name: string;
    avatar: string;
  };
  attachments?: { name: string; url: string }[];
  tags?: string[];
}

export interface ThreadedFeedback extends ExtendedFeedback {
  parentId?: string;
  replies?: ExtendedFeedback[];
  isResolved?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  avatar?: string;
  status: 'active' | 'pending';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface ActivityLog {
  id: string;
  actionType: "feedback" | "approval" | "revision" | "statusChange";
  actorName: string;
  actorRole: string;
  relatedDeliverableId: string;
  message: string;
  timestamp: string;
}
