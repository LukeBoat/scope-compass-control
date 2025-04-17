import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { TeamMember } from '../types';

interface UseTeamCollaborationReturn {
  isLoading: boolean;
  error: Error | null;
  inviteTeamMember: (name: string, email: string, role: TeamMember['role']) => Promise<void>;
  updateTeamMember: (memberId: string, role: TeamMember['role']) => Promise<void>;
  removeTeamMember: (memberId: string) => Promise<void>;
}

export function useTeamCollaboration(): UseTeamCollaborationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const functions = getFunctions();

  const inviteTeamMember = async (name: string, email: string, role: TeamMember['role']): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const inviteTeamMemberFn = httpsCallable(functions, 'onTeamMemberInvite');
      await inviteTeamMemberFn({ name, email, role });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to invite team member'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTeamMember = async (memberId: string, role: TeamMember['role']): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const updateTeamMemberFn = httpsCallable(functions, 'updateTeamMember');
      await updateTeamMemberFn({ memberId, role });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update team member'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeTeamMember = async (memberId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const removeTeamMemberFn = httpsCallable(functions, 'removeTeamMember');
      await removeTeamMemberFn({ memberId });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove team member'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember,
  };
} 