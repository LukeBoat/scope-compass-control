import { TeamMember } from "@/types";

export type Permission = 
  | "manage:team"
  | "manage:project"
  | "edit:deliverables"
  | "view:deliverables"
  | "edit:milestones"
  | "view:milestones"
  | "edit:invoices"
  | "view:invoices"
  | "edit:comments"
  | "view:comments";

export type ResourceType = 
  | "team"
  | "project"
  | "deliverables"
  | "milestones"
  | "invoices"
  | "comments";

export type ActionType = 
  | "manage"
  | "edit"
  | "view";

// Define permissions for each role
const rolePermissions: Record<TeamMember["role"], Permission[]> = {
  owner: [
    "manage:team",
    "manage:project",
    "edit:deliverables",
    "view:deliverables",
    "edit:milestones",
    "view:milestones",
    "edit:invoices",
    "view:invoices",
    "edit:comments",
    "view:comments"
  ],
  editor: [
    "view:team",
    "view:project",
    "edit:deliverables",
    "view:deliverables",
    "edit:milestones",
    "view:milestones",
    "view:invoices",
    "edit:comments",
    "view:comments"
  ],
  viewer: [
    "view:team",
    "view:project",
    "view:deliverables",
    "view:milestones",
    "view:invoices",
    "view:comments"
  ]
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: TeamMember["role"], permission: Permission): boolean {
  return rolePermissions[userRole]?.includes(permission) || false;
}

/**
 * Check if a user can perform an action on a resource
 */
export function canPerformAction(
  userRole: TeamMember["role"], 
  action: ActionType, 
  resource: ResourceType
): boolean {
  const permission = `${action}:${resource}` as Permission;
  return hasPermission(userRole, permission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: TeamMember["role"]): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Get a human-readable description of what a role can do
 */
export function getRoleCapabilities(role: TeamMember["role"]): string[] {
  const permissions = rolePermissions[role] || [];
  
  const capabilities: Record<ResourceType, string[]> = {
    team: [],
    project: [],
    deliverables: [],
    milestones: [],
    invoices: [],
    comments: []
  };
  
  permissions.forEach(permission => {
    const [action, resource] = permission.split(":") as [ActionType, ResourceType];
    
    if (action === "manage") {
      capabilities[resource].push(`Full control over ${resource}`);
    } else if (action === "edit") {
      capabilities[resource].push(`Can edit ${resource}`);
    } else if (action === "view") {
      capabilities[resource].push(`Can view ${resource}`);
    }
  });
  
  return Object.values(capabilities).flat().filter(Boolean);
} 