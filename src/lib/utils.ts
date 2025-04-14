import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Project } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateProgress(project: Project): number {
  if (!project.deliverables?.length) return 0;
  
  const completedDeliverables = project.deliverables.filter(
    deliverable => deliverable.status === "Approved"
  ).length;
  
  return Math.round((completedDeliverables / project.deliverables.length) * 100);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
