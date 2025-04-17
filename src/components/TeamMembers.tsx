import { useState } from "react";
import { TeamMember } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Mail, Shield, MoreVertical, Check, X } from "lucide-react";
import { toast } from "sonner";

interface TeamMembersProps {
  teamMembers: TeamMember[];
  onAddMember: (member: Omit<TeamMember, "id" | "status">) => Promise<void>;
  onUpdateRole: (memberId: string, role: TeamMember["role"]) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  currentUserId: string;
}

export function TeamMembers({
  teamMembers,
  onAddMember,
  onUpdateRole,
  onRemoveMember,
  currentUserId
}: TeamMembersProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "viewer" as TeamMember["role"]
  });

  const handleInvite = async () => {
    try {
      await onAddMember(newMember);
      setNewMember({ name: "", email: "", role: "viewer" });
      setIsInviteDialogOpen(false);
      toast.success("Team member invited successfully");
    } catch (error) {
      toast.error("Failed to invite team member");
    }
  };

  const getRoleColor = (role: TeamMember["role"]) => {
    switch (role) {
      case "admin":
        return "bg-brand-purple/10 text-brand-purple";
      case "editor":
        return "bg-brand-blue/10 text-brand-blue";
      case "viewer":
        return "bg-brand-muted-gray text-brand-neutral-dark";
      default:
        return "bg-brand-muted-gray text-brand-neutral-dark";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-2 font-display">Team Members</h2>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <PlusCircle className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={e => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter member's name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={e => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter member's email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newMember.role}
                  onValueChange={value => setNewMember(prev => ({ ...prev, role: value as TeamMember["role"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={!newMember.name || !newMember.email}>
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {teamMembers.map(member => (
          <Card key={member.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{member.name}</h3>
                    {member.status === "pending" && (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                        Pending
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {member.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className={getRoleColor(member.role)}>
                  <Shield className="h-3 w-3 mr-1" />
                  {member.role}
                </Badge>
                {member.id !== currentUserId && (
                  <Select
                    value={member.role}
                    onValueChange={value => onUpdateRole(member.id, value as TeamMember["role"])}
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
                )}
                {member.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700"
                      onClick={() => onUpdateRole(member.id, member.role)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      onClick={() => onRemoveMember(member.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 