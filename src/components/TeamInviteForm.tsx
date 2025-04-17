import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTeamCollaboration } from '../hooks/useTeamCollaboration';
import { Alert } from './ui/alert';

const inviteFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'member', 'viewer'], {
    required_error: 'Please select a role',
  }),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

interface TeamInviteFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function TeamInviteForm({ projectId, onSuccess }: TeamInviteFormProps) {
  const { isLoading, error, inviteTeamMember } = useTeamCollaboration();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
  });

  const onSubmit = async (data: InviteFormData) => {
    const success = await inviteTeamMember(projectId, data.email, data.role);
    if (success) {
      reset();
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          {error.message}
        </Alert>
      )}
      
      <div className="space-y-2">
        <Input
          {...register('email')}
          type="email"
          placeholder="Enter email address"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Select
          onValueChange={(value) => register('role').onChange({ target: { value } })}
        >
          <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-500">{errors.role.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending Invite...' : 'Send Invite'}
      </Button>
    </form>
  );
} 