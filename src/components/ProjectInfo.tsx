
import { useState } from "react";
import { Project } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Clock, FileText, CalendarDays, RotateCcw, Edit2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toastSuccess } from "./ToastNotification";

interface ProjectInfoProps {
  project: Project;
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  // States for editable fields
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [clientName, setClientName] = useState(project.clientName);
  const [description, setDescription] = useState(project.description);

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

  // Handle saving project name
  const handleSaveProjectName = () => {
    // Here you would update the project in your database
    setIsEditingName(false);
    toastSuccess("Project updated", "Project name has been updated", {
      projectColor: "#9b87f5"
    });
  };

  // Handle saving client name
  const handleSaveClientName = () => {
    // Here you would update the project in your database
    setIsEditingClient(false);
    toastSuccess("Project updated", "Client name has been updated", {
      projectColor: "#9b87f5"
    });
  };

  // Handle saving description
  const handleSaveDescription = () => {
    // Here you would update the project in your database
    setIsEditingDescription(false);
    toastSuccess("Project updated", "Project description has been updated", {
      projectColor: "#9b87f5"
    });
  };

  // Cancel editing
  const handleCancelEdit = (field: 'name' | 'client' | 'description') => {
    if (field === 'name') {
      setProjectName(project.name);
      setIsEditingName(false);
    } else if (field === 'client') {
      setClientName(project.clientName);
      setIsEditingClient(false);
    } else {
      setDescription(project.description);
      setIsEditingDescription(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        {isEditingName ? (
          <div className="flex items-center gap-2 w-full">
            <Input 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="font-medium text-lg"
              autoFocus
            />
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleSaveProjectName}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => handleCancelEdit('name')}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Project Details</h3>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEditingName(true)}
              className="p-1 h-auto"
            >
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {isEditingClient ? (
          <div className="flex items-center gap-2 w-full">
            <Input 
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="font-medium"
              autoFocus
            />
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleSaveClientName}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => handleCancelEdit('client')}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Client: <span className="font-medium text-foreground">{project.clientName}</span></p>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEditingClient(true)}
              className="p-1 h-auto"
            >
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Start Date</span>
              </div>
              <span className="font-medium">{formatDate(project.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Due Date</span>
              </div>
              <span className="font-medium">{formatDate(project.endDate)}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Days Remaining</span>
              </div>
              <Badge variant="outline" className="font-medium">{calculateDaysRemaining()} days</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deliverables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total Deliverables</span>
              </div>
              <span className="font-medium">{project.deliverables.length}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Revision Limit</span>
              </div>
              <span className="font-medium">{project.revisionLimit}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Revisions Used</span>
              </div>
              <Badge variant="outline" className={project.revisionsUsed >= project.revisionLimit ? "bg-red-100 text-red-800 hover:bg-red-200" : "font-medium"}>
                {project.revisionsUsed}/{project.revisionLimit}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Project Description</h3>
          {!isEditingDescription && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEditingDescription(true)}
              className="p-1 h-auto"
            >
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
        <Card>
          <CardContent className="p-4">
            {isEditingDescription ? (
              <div className="space-y-2">
                <Textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleCancelEdit('description')}
                    className="text-red-600"
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-brand-purple hover:bg-brand-purple-dark"
                    onClick={handleSaveDescription}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <p>{project.description}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
