import { useState } from "react";
import { Project } from "@/types";
import { useProject } from "@/hooks/useProject";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Clock, FileText, CalendarDays, RotateCcw, Edit2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toastSuccess } from "./ToastNotification";

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
    <Card>
      <CardHeader>
        <CardTitle>Project Information</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Project Name</label>
              <Input
                value={editedProject.name}
                onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Client Name</label>
              <Input
                value={editedProject.clientName}
                onChange={(e) => setEditedProject({ ...editedProject, clientName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editedProject.description}
                onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Project Name</label>
              <p>{project.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Client Name</label>
              <p>{project.clientName}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <p>{project.description}</p>
            </div>
            <Button onClick={handleEdit}>Edit</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
