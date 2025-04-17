import React from 'react';
import { useTeamCollaboration } from '../hooks/useTeamCollaboration';
import { Button } from './ui/button';
import { Alert } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TeamMember } from '../types';

interface TeamMemberListProps {
  projectId: string;
  members: TeamMember[];
  onMemberUpdate?: () => void;
}

export function TeamMemberList({ projectId, members, onMemberUpdate }: TeamMemberListProps) {
  const { isLoading, error, updateTeamMember, removeTeamMember } = useTeamCollaboration();

  const handleRoleChange = async (memberId: string, newRole: "owner" | "editor" | "viewer") => {
    const success = await updateTeamMember(memberId, { role: newRole });
    if (success) {
      onMemberUpdate?.();
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const success = await removeTeamMember(memberId);
    if (success) {
      onMemberUpdate?.();
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        {error.message}
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Select
              defaultValue={member.role}
              onValueChange={(value: "owner" | "editor" | "viewer") => handleRoleChange(member.id, value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveMember(member.id)}
              disabled={isLoading}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}

      {members.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No team members found
        </div>
      )}
    </div>
  );
} 