import { z } from "zod";
import { MilestoneVisibility, DeliverableStatus, InvoiceStatus } from "@/types";

// Milestone validation schema
export const milestoneSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  dueDate: z.string()
    .datetime()
    .refine((date) => new Date(date) > new Date(), "Due date cannot be in the past"),
  startDate: z.string()
    .datetime()
    .optional(),
  isComplete: z.boolean()
    .default(false),
  visibility: z.enum(["Internal", "Client", "Public"] as const)
    .default("Public"),
  projectId: z.string()
    .min(1, "Project ID is required"),
});

// Feedback validation schema
export const feedbackSchema = z.object({
  id: z.string(),
  content: z.string().min(1, "Feedback content is required"),
  author: z.enum(["client", "admin"]),
  createdAt: z.date(),
  status: z.enum(["info", "approved", "change-requested"]).optional(),
});

export const revisionSchema = z.object({
  content: z.string().min(1, "Revision content is required"),
  author: z.enum(["Client", "Admin"]),
  createdAt: z.string().datetime()
});

// Deliverable validation schema
export const deliverableSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  status: z.enum([
    "Not Started",
    "In Progress",
    "Delivered",
    "Approved",
    "Rejected",
    "In Review"
  ] as const),
  dueDate: z.string()
    .datetime()
    .refine((date) => new Date(date) > new Date(), "Due date cannot be in the past"),
  notes: z.string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
  milestoneId: z.string()
    .min(1, "Milestone ID is required"),
  isApproved: z.boolean()
    .default(false),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  assignedTo: z.string()
    .optional(),
  visibility: z.enum(["Internal", "Client", "Public"] as const)
    .default("Public"),
  projectId: z.string()
    .min(1, "Project ID is required"),
  revisions: z.array(revisionSchema).default([]),
  feedback: z.array(feedbackSchema).default([]),
  approvalStatus: z.enum(["Pending", "Approved", "Changes Requested"]).default("Pending"),
  title: z.string().optional(),
});

// Invoice validation schema
export const invoiceSchema = z.object({
  projectId: z.string()
    .min(1, "Project ID is required"),
  milestoneId: z.string()
    .optional(),
  dueDate: z.string()
    .datetime()
    .refine((date) => new Date(date) > new Date(), "Due date cannot be in the past"),
  lineItems: z.array(z.object({
    id: z.string(),
    label: z.string()
      .min(3, "Label must be at least 3 characters")
      .max(100, "Label must be less than 100 characters"),
    amount: z.number()
      .min(0, "Amount must be greater than 0"),
    type: z.enum(["deliverable", "hours", "fee", "other"] as const),
    deliverableId: z.string()
      .optional(),
    description: z.string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    quantity: z.number()
      .min(1, "Quantity must be at least 1")
      .optional(),
    unitPrice: z.number()
      .min(0, "Unit price must be greater than 0")
      .optional(),
  }))
  .min(1, "At least one line item is required"),
  total: z.number()
    .min(0, "Total must be greater than 0"),
  status: z.enum(["Draft", "Sent", "Paid", "Overdue"] as const)
    .default("Draft"),
  notes: z.string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
  currency: z.string()
    .default("USD"),
  isRecurring: z.boolean()
    .default(false),
  recurringInterval: z.enum(["weekly", "monthly", "quarterly", "annually"] as const)
    .optional(),
  paymentInstructions: z.string()
    .max(1000, "Payment instructions must be less than 1000 characters")
    .optional(),
  termsAndConditions: z.string()
    .max(2000, "Terms and conditions must be less than 2000 characters")
    .optional(),
});

// Invoice line item validation schema
export const invoiceLineItemSchema = z.object({
  label: z.string()
    .min(3, "Label must be at least 3 characters")
    .max(100, "Label must be less than 100 characters"),
  amount: z.number()
    .min(0, "Amount must be greater than 0"),
  type: z.enum(["deliverable", "hours", "fee", "other"] as const),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  quantity: z.number()
    .min(1, "Quantity must be at least 1")
    .optional(),
  unitPrice: z.number()
    .min(0, "Unit price must be greater than 0")
    .optional(),
}); 