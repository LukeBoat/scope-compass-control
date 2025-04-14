
import { Project } from "@/types";

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    clientName: "Acme Corp",
    description: "Complete redesign of company website with new branding and improved UX",
    status: "Active",
    startDate: "2025-03-01",
    endDate: "2025-05-15",
    revisionLimit: 3,
    revisionsUsed: 2,
    progress: 65,
    deliverables: [
      {
        id: "d1",
        projectId: "1",
        name: "Homepage Design",
        status: "Approved",
        dueDate: "2025-03-15",
        notes: "Client loved the design!",
        fileUrl: "https://example.com/file1",
        revisions: [
          {
            id: "r1",
            deliverableId: "d1",
            date: "2025-03-10",
            notes: "Adjusted hero section colors per feedback",
          },
          {
            id: "r2",
            deliverableId: "d1",
            date: "2025-03-12",
            notes: "Updated CTA placement and font size",
          }
        ]
      },
      {
        id: "d2",
        projectId: "1",
        name: "About Us Page",
        status: "In Progress",
        dueDate: "2025-03-30",
        notes: "Working on team section layout",
        revisions: []
      },
      {
        id: "d3",
        projectId: "1",
        name: "Services Page",
        status: "Not Started",
        dueDate: "2025-04-10",
        revisions: []
      }
    ]
  },
  {
    id: "2",
    name: "Brand Identity",
    clientName: "StartUp Inc",
    description: "New logo and brand guidelines for tech startup",
    status: "Active",
    startDate: "2025-02-15",
    endDate: "2025-04-01",
    revisionLimit: 5,
    revisionsUsed: 3,
    progress: 75,
    deliverables: [
      {
        id: "d4",
        projectId: "2",
        name: "Logo Design",
        status: "Delivered",
        dueDate: "2025-03-01",
        notes: "Awaiting final approval",
        fileUrl: "https://example.com/file2",
        revisions: [
          {
            id: "r3",
            deliverableId: "d4",
            date: "2025-02-20",
            notes: "Modified color scheme",
          },
          {
            id: "r4",
            deliverableId: "d4",
            date: "2025-02-25",
            notes: "Refined typography and spacing",
          },
          {
            id: "r5",
            deliverableId: "d4",
            date: "2025-02-28",
            notes: "Final adjustments to icon proportions",
          }
        ]
      },
      {
        id: "d5",
        projectId: "2",
        name: "Brand Guidelines",
        status: "In Progress",
        dueDate: "2025-03-20",
        notes: "Currently drafting typography section",
        revisions: []
      }
    ]
  },
  {
    id: "3",
    name: "Marketing Campaign",
    clientName: "Global Retail",
    description: "Q2 digital marketing campaign for new product line",
    status: "On Hold",
    startDate: "2025-01-10",
    endDate: "2025-03-15",
    revisionLimit: 4,
    revisionsUsed: 2,
    progress: 40,
    deliverables: [
      {
        id: "d6",
        projectId: "3",
        name: "Campaign Strategy",
        status: "Approved",
        dueDate: "2025-01-25",
        notes: "Approved after client meeting",
        revisions: [
          {
            id: "r6",
            deliverableId: "d6",
            date: "2025-01-20",
            notes: "Expanded target audience definitions",
          },
          {
            id: "r7",
            deliverableId: "d6",
            date: "2025-01-22",
            notes: "Added budget allocation breakdown",
          }
        ]
      },
      {
        id: "d7",
        projectId: "3",
        name: "Social Media Assets",
        status: "In Progress",
        dueDate: "2025-02-15",
        notes: "On hold until client provides product photos",
        revisions: []
      }
    ]
  },
  {
    id: "4",
    name: "E-commerce Development",
    clientName: "Boutique Clothing",
    description: "Custom e-commerce platform with inventory management",
    status: "Completed",
    startDate: "2024-10-01",
    endDate: "2025-01-31",
    revisionLimit: 6,
    revisionsUsed: 4,
    progress: 100,
    deliverables: [
      {
        id: "d8",
        projectId: "4",
        name: "Store Design",
        status: "Approved",
        dueDate: "2024-11-01",
        notes: "Final design implemented in code",
        fileUrl: "https://example.com/file3",
        revisions: [
          {
            id: "r8",
            deliverableId: "d8",
            date: "2024-10-15",
            notes: "Updated product page layout",
          },
          {
            id: "r9",
            deliverableId: "d8",
            date: "2024-10-25",
            notes: "Refined checkout process flow",
          }
        ]
      },
      {
        id: "d9",
        projectId: "4",
        name: "Payment Integration",
        status: "Approved",
        dueDate: "2024-12-01",
        notes: "Successfully integrated Stripe and PayPal",
        revisions: [
          {
            id: "r10",
            deliverableId: "d9",
            date: "2024-11-20",
            notes: "Added Apple Pay support",
          }
        ]
      },
      {
        id: "d10",
        projectId: "4",
        name: "Inventory System",
        status: "Approved",
        dueDate: "2025-01-15",
        notes: "Completed with automated stock alerts",
        revisions: [
          {
            id: "r11",
            deliverableId: "d10",
            date: "2025-01-05",
            notes: "Enhanced reporting features",
          }
        ]
      }
    ]
  }
];
