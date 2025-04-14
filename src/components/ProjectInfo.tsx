import { useState } from "react";
import { Project } from "@/types";
import { useProject } from "@/hooks/useProject";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Clock, FileText, CalendarDays, RotateCcw, Edit2, Check, X, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toastSuccess } from "./ToastNotification";
import { ActivityLog } from "./ActivityLog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

interface ProjectInfoProps {
  projectId: string;
}

export function ProjectInfo({ projectId }: ProjectInfoProps) {
  const { project, updateProject } = useProject(projectId);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Partial<Project>>({});

  if (!project) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  };

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(project.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleEdit = () => {
    setEditedProject({
      name: project.name,
      clientName: project.clientName,
      description: project.description
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateProject(editedProject);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProject({});
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Project Overview</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={editedProject.name}
                  onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={editedProject.clientName}
                  onChange={(e) => setEditedProject({ ...editedProject, clientName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedProject.description}
                  onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Client</span>
                  </div>
                  <p className="text-lg">{project.clientName}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>Timeline</span>
                  </div>
                  <p className="text-lg">
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                  <Badge variant={project.status === "Active" ? "default" : "secondary"}>
                    {project.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    <span>Days Remaining</span>
                  </div>
                  <p className="text-lg">{calculateDaysRemaining()} days</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Description</span>
                </div>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <ActivityLog project={project} limit={5} />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
