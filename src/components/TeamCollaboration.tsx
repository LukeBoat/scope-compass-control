import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { UserPlus, Mail, Shield, X, Info, Crown, Edit, Eye } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  avatar?: string;
  status: 'active' | 'pending';
}

interface TeamCollaborationProps {
  projectId: string;
  teamMembers: TeamMember[];
  onInviteMember: (name: string, email: string, role: TeamMember['role']) => Promise<void>;
  onUpdateRole: (memberId: string, role: TeamMember['role']) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  currentUserRole?: TeamMember['role'];
}

const roleDescriptions = {
  owner: {
    title: 'Owner',
    description: 'Full access to project settings, team management, and all project content',
    icon: Crown,
    permissions: [
      'Manage team members and roles',
      'Edit project settings and configuration',
      'Create and edit all project content',
      'View all project information'
    ]
  },
  editor: {
    title: 'Editor',
    description: 'Can edit project content and manage deliverables',
    icon: Edit,
    permissions: [
      'Create and edit project content',
      'Manage deliverables and milestones',
      'Add comments and feedback',
      'View all project information'
    ]
  },
  viewer: {
    title: 'Viewer',
    description: 'Can view project content only',
    icon: Eye,
    permissions: [
      'View project content and information',
      'Add comments on deliverables',
      'No editing permissions'
    ]
  }
};

export function TeamCollaboration({
  projectId,
  teamMembers,
  onInviteMember,
  onUpdateRole,
  onRemoveMember,
  currentUserRole = 'viewer'
}: TeamCollaborationProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('viewer');
  const [isLoading, setIsLoading] = useState(false);

  const canManageTeam = currentUserRole === 'owner';

  const handleInvite = async () => {
    if (!inviteEmail || !inviteName) {
      toast.error('Please enter both name and email address');
      return;
    }

    setIsLoading(true);
    try {
      await onInviteMember(inviteName, inviteEmail, inviteRole);
      setInviteName('');
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
    if (!canManageTeam) {
      toast.error('You do not have permission to update roles');
      return;
    }

    try {
      await onUpdateRole(memberId, role);
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (!canManageTeam) {
      toast.error('You do not have permission to remove members');
      return;
    }

    if (member.role === 'owner') {
      toast.error('Cannot remove the project owner');
      return;
    }

    setMemberToRemove(member);
    setShowRemoveDialog(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await onRemoveMember(memberToRemove.id);
      setShowRemoveDialog(false);
      setMemberToRemove(null);
      toast.success('Member removed successfully');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    const Icon = roleDescriptions[role].icon;
    return <Icon className="h-4 w-4 mr-1" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team Members</h2>
        {canManageTeam && (
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
                <DialogDescription>
                  Add a new member to your project team. They will receive an invitation email.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Enter member's name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>
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
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-medium">{roleDescriptions[inviteRole].title}</p>
                    <p className="text-sm text-muted-foreground">{roleDescriptions[inviteRole].description}</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {roleDescriptions[inviteRole].permissions.map((permission, index) => (
                        <li key={index}>{permission}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button onClick={handleInvite} disabled={isLoading} className="w-full">
                  {isLoading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
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
              {canManageTeam && member.role !== 'owner' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Select
                          value={member.role}
                          onValueChange={(value: TeamMember['role']) => handleUpdateRole(member.id, value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2">
                        <p className="font-medium">{roleDescriptions[member.role].title}</p>
                        <p>{roleDescriptions[member.role].description}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="flex items-center">
                {getRoleIcon(member.role)}
                {roleDescriptions[member.role].title}
              </Badge>
              {canManageTeam && member.role !== 'owner' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member)}
                  className="text-destructive hover:text-destructive/90"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from the team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemoveMember}>
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 