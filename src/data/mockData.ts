import { Project, ProjectStatus } from "@/types";

export const mockProjects: Record<string, Project> = {
  "project-1": {
    id: "project-1",
    name: "Website Redesign",
    description: "Complete overhaul of company website",
    status: "In Progress" as ProjectStatus,
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    budget: 50000,
    client: "Acme Corp",
    teamMembers: [
      { id: "user-1", name: "John Doe", email: "john@example.com", role: "owner", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John", status: "active" },
      { id: "user-2", name: "Jane Smith", email: "jane@example.com", role: "editor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane", status: "active" }
    ],
    milestones: [],
    deliverables: [],
    invoices: [],
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString()
  },
  "project-2": {
    id: "project-2",
    name: "Mobile App Development",
    description: "iOS and Android app for client portal",
    status: "Active" as ProjectStatus,
    startDate: "2024-02-01",
    endDate: "2024-08-31",
    budget: 75000,
    client: "TechStart Inc",
    teamMembers: [
      { id: "user-1", name: "John Doe", email: "john@example.com", role: "owner", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John", status: "active" },
      { id: "user-3", name: "Bob Wilson", email: "bob@example.com", role: "editor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", status: "active" }
    ],
    milestones: [],
    deliverables: [],
    invoices: [],
    createdAt: new Date("2024-02-01").toISOString(),
    updatedAt: new Date("2024-02-01").toISOString()
  },
  "project-3": {
    id: "project-3",
    name: "E-commerce Platform",
    description: "Online store with payment integration",
    status: "Completed" as ProjectStatus,
    startDate: "2023-09-01",
    endDate: "2024-01-31",
    budget: 100000,
    client: "Retail Co",
    teamMembers: [
      { id: "user-2", name: "Jane Smith", email: "jane@example.com", role: "owner", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane", status: "active" },
      { id: "user-3", name: "Bob Wilson", email: "bob@example.com", role: "editor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", status: "active" }
    ],
    milestones: [],
    deliverables: [],
    invoices: [],
    createdAt: new Date("2023-09-01").toISOString(),
    updatedAt: new Date("2024-01-31").toISOString()
  },
  "project-4": {
    id: "project-4",
    name: "Content Management System",
    description: "Custom CMS for client website",
    status: "On Hold" as ProjectStatus,
    startDate: "2024-03-01",
    endDate: "2024-09-30",
    budget: 60000,
    client: "Media Group",
    teamMembers: [
      { id: "user-1", name: "John Doe", email: "john@example.com", role: "owner", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John", status: "active" },
      { id: "user-2", name: "Jane Smith", email: "jane@example.com", role: "editor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane", status: "active" },
      { id: "user-3", name: "Bob Wilson", email: "bob@example.com", role: "viewer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", status: "active" }
    ],
    milestones: [],
    deliverables: [],
    invoices: [],
    createdAt: new Date("2024-03-01").toISOString(),
    updatedAt: new Date("2024-03-01").toISOString()
  }
};
