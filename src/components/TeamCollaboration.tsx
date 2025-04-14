import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Mail, Shield, X } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  status: 'active' | 'pending';
}

interface TeamCollaborationProps {
  projectId: string;
  teamMembers: TeamMember[];
  onInviteMember: (email: string, role: TeamMember['role']) => Promise<void>;
  onUpdateRole: (memberId: string, role: TeamMember['role']) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
}

export function TeamCollaboration({
  projectId,
  teamMembers,
  onInviteMember,
  onUpdateRole,
  onRemoveMember,
}: TeamCollaborationProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('viewer');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      await onInviteMember(inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole('viewer');
      setShowInviteDialog(false);
      toast.success('Invitation sent successfully');
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, role: TeamMember['role']) => {
    try {
      await onUpdateRole(memberId, role);
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await onRemoveMember(memberId);
      toast.success('Member removed successfully');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team Members</h2>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Role
                </label>
                <Select value={inviteRole} onValueChange={(value: TeamMember['role']) => setInviteRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleInvite} disabled={isLoading} className="w-full">
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {teamMembers.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-muted-foreground">{member.email}</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select
                value={member.role}
                onValueChange={(value: TeamMember['role']) => handleUpdateRole(member.id, value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                {member.status}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveMember(member.id)}
                className="text-destructive hover:text-destructive/90"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 