import { useState } from "react";
import { Project, DeliverableStatus, Deliverable } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  FileCheck, 
  Link as LinkIcon, 
  MoreVertical, 
  Clock,
  RotateCcw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toastSuccess, toastError, toastInfo } from "./ToastNotification";

interface ProjectDeliverablesProps {
  project: Project;
}

export function ProjectDeliverables({ project }: ProjectDeliverablesProps) {
  // Store the last deleted deliverable for undo functionality
  const [lastDeletedDeliverable, setLastDeletedDeliverable] = useState<Deliverable | null>(null);
  
  // Group deliverables by status
  const deliverablesByStatus = {
    "Not Started": project.deliverables.filter(d => d.status === "Not Started"),
    "In Progress": project.deliverables.filter(d => d.status === "In Progress"),
    "Delivered": project.deliverables.filter(d => d.status === "Delivered"),
    "Approved": project.deliverables.filter(d => d.status === "Approved")
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  const getStatusColor = (status: DeliverableStatus) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-100 text-gray-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
    }
  };

  const handleStatusChange = (deliverableId: string, newStatus: DeliverableStatus) => {
    toastSuccess("Status updated", `Deliverable status changed to ${newStatus}`, {
      projectColor: "#9b87f5" // Project purple color
    });
    
    if (newStatus === "Approved") {
      toastSuccess("Deliverable approved! 🎉", "This deliverable has been marked as approved.");
    }
  };

  const handleAddFileLink = (deliverableId: string) => {
    toastInfo("Add file link", "You can attach a file link to this deliverable", {
      projectColor: "#9b87f5"
    });
  };

  const handleLogRevision = (deliverableId: string) => {
    toastInfo("Log revision", "You can log a revision for this deliverable", {
      projectColor: "#9b87f5"
    });
  };

  const handleDeleteDeliverable = (deliverableId: string, deliverableName: string) => {
    // Find the deliverable to store for potential undo
    const deliverableToDelete = project.deliverables.find(d => d.id === deliverableId) || null;
    setLastDeletedDeliverable(deliverableToDelete);
    
    // Show toast with undo option
    toastError("Deliverable deleted", `"${deliverableName}" has been removed from this project", {
      onUndo: handleUndoDelete,
      projectColor: "#ea384c" // Red for deletion
    });
  };
  
  const handleUndoDelete = () => {
    if (lastDeletedDeliverable) {
      toastSuccess("Deletion undone", `"${lastDeletedDeliverable.name}" has been restored", {
        projectColor: "#9b87f5"
      });
      setLastDeletedDeliverable(null);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Deliverables</h3>
      
      {Object.entries(deliverablesByStatus).map(([status, deliverables]) => (
        deliverables.length > 0 && (
          <div key={status} className="space-y-3">
            <h4 className="text-md font-medium flex items-center gap-2">
              <Badge className={getStatusColor(status as DeliverableStatus)}>
                {status} ({deliverables.length})
              </Badge>
            </h4>
            <div className="space-y-3">
              {deliverables.map(deliverable => (
                <Card key={deliverable.id} className="overflow-hidden">
                  <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-md font-medium">{deliverable.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAddFileLink(deliverable.id)}>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Add File Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleLogRevision(deliverable.id)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Log Revision
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteDeliverable(deliverable.id, deliverable.name)}
                        >
                          Delete Deliverable
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="px-4 py-3 border-t bg-muted/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Due {formatDate(deliverable.dueDate)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Revisions: {deliverable.revisions.length}
                          </span>
                        </div>
                      </div>
                      
                      <Select 
                        defaultValue={deliverable.status}
                        onValueChange={(value) => handleStatusChange(deliverable.id, value as DeliverableStatus)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {deliverable.notes && (
                      <div className="mt-3">
                        <p className="text-sm">{deliverable.notes}</p>
                      </div>
                    )}
                    
                    {deliverable.fileUrl && (
                      <div className="mt-3">
                        <a 
                          href={deliverable.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <LinkIcon className="h-3 w-3" />
                          Attached File
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      ))}
      
      {project.deliverables.length === 0 && (
        <div className="text-center py-8">
          <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium">No deliverables yet</h3>
          <p className="text-muted-foreground mb-4">Add deliverables to track your project progress.</p>
          <Button 
            className="bg-brand-purple hover:bg-brand-purple-dark"
            onClick={() => toastSuccess("Ready to add", "Click 'Add Deliverable' to create your first deliverable")}
          >
            Add First Deliverable
          </Button>
        </div>
      )}
    </div>
  );
}
