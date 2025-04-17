import { useAuth } from "@/hooks/useAuth";
import { TeamMember } from "@/types";
import { 
  Permission, 
  ResourceType, 
  ActionType, 
  hasPermission, 
  canPerformAction,
  getRoleCapabilities
} from "@/lib/permissions";

interface UsePermissionsProps {
  projectId: string;
  teamMembers: TeamMember[];
}

export function usePermissions({ projectId, teamMembers }: UsePermissionsProps) {
  const { user } = useAuth();
  
  // Find the current user's role in the project
  const currentUserRole = teamMembers.find(member => member.id === user?.id)?.role || 'viewer';
  
  // Check if user has a specific permission
  const hasUserPermission = (permission: Permission): boolean => {
    return hasPermission(currentUserRole, permission);
  };
  
  // Check if user can perform an action on a resource
  const canUserPerformAction = (action: ActionType, resource: ResourceType): boolean => {
    return canPerformAction(currentUserRole, action, resource);
  };
  
  // Get all capabilities for the current user's role
  const getUserCapabilities = (): string[] => {
    return getRoleCapabilities(currentUserRole);
  };
  
  // Convenience methods for common permission checks
  const canManageTeam = hasUserPermission("manage:team");
  const canManageProject = hasUserPermission("manage:project");
  const canEditDeliverables = hasUserPermission("edit:deliverables");
  const canViewDeliverables = hasUserPermission("view:deliverables");
  const canEditMilestones = hasUserPermission("edit:milestones");
  const canViewMilestones = hasUserPermission("view:milestones");
  const canEditInvoices = hasUserPermission("edit:invoices");
  const canViewInvoices = hasUserPermission("view:invoices");
  const canEditComments = hasUserPermission("edit:comments");
  const canViewComments = hasUserPermission("view:comments");
  
  return {
    currentUserRole,
    hasUserPermission,
    canUserPerformAction,
    getUserCapabilities,
    canManageTeam,
    canManageProject,
    canEditDeliverables,
    canViewDeliverables,
    canEditMilestones,
    canViewMilestones,
    canEditInvoices,
    canViewInvoices,
    canEditComments,
    canViewComments
  };
} 