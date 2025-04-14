import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TeamMember } from '@/types';

interface UseTeamCollaborationProps {
  projectId: string;
}

export function useTeamCollaboration({ projectId }: UseTeamCollaborationProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch team members
  const { data: teamMembers = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['teamMembers', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/team`);
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      return response.json() as Promise<TeamMember[]>;
    },
  });

  // Invite team member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: TeamMember['role'] }) => {
      const response = await fetch(`/api/projects/${projectId}/team/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        throw new Error('Failed to invite team member');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', projectId] });
      toast.success('Team member invited successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to invite team member');
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: TeamMember['role'] }) => {
      const response = await fetch(`/api/projects/${projectId}/team/${memberId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', projectId] });
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update role');
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await fetch(`/api/projects/${projectId}/team/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove team member');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', projectId] });
      toast.success('Team member removed successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove team member');
    },
  });

  // Handler functions
  const handleInviteMember = useCallback(
    async (email: string, role: TeamMember['role']) => {
      setIsLoading(true);
      try {
        await inviteMemberMutation.mutateAsync({ email, role });
      } finally {
        setIsLoading(false);
      }
    },
    [inviteMemberMutation]
  );

  const handleUpdateRole = useCallback(
    async (memberId: string, role: TeamMember['role']) => {
      setIsLoading(true);
      try {
        await updateRoleMutation.mutateAsync({ memberId, role });
      } finally {
        setIsLoading(false);
      }
    },
    [updateRoleMutation]
  );

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      setIsLoading(true);
      try {
        await removeMemberMutation.mutateAsync(memberId);
      } finally {
        setIsLoading(false);
      }
    },
    [removeMemberMutation]
  );

  return {
    teamMembers,
    isLoading: isLoading || isLoadingMembers,
    inviteMember: handleInviteMember,
    updateRole: handleUpdateRole,
    removeMember: handleRemoveMember,
  };
} 