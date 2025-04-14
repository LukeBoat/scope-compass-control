
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
  RotateCcw,
  ExternalLink
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
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface ProjectDeliverablesProps {
  project: Project;
}

export function ProjectDeliverables({ project }: ProjectDeliverablesProps) {
  // Store the last deleted deliverable for undo functionality
  const [lastDeletedDeliverable, setLastDeletedDeliverable] = useState<Deliverable | null>(null);
  
  // States for file link dialog
  const [fileLinkDialogOpen, setFileLinkDialogOpen] = useState(false);
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [fileLabel, setFileLabel] = useState("");
  
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
    setSelectedDeliverableId(deliverableId);
    setFileUrl("");
    setFileLabel("");
    setFileLinkDialogOpen(true);
  };

  const handleSaveFileLink = () => {
    if (!fileUrl) {
      toastError("Error", "Please enter a valid URL");
      return;
    }

    // Process the URL to ensure it has http/https
    let processedUrl = fileUrl;
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }

    const label = fileLabel || new URL(processedUrl).hostname;
    
    toastSuccess("File link added", `Link "${label}" has been attached to this deliverable`, {
      projectColor: "#9b87f5"
    });
    
    setFileLinkDialogOpen(false);
  };

  const handleURLPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    setFileUrl(pastedText);
    
    // Try to extract domain for the label if no label is provided
    if (!fileLabel) {
      try {
        const url = new URL(pastedText);
        setFileLabel(url.hostname.replace('www.', ''));
      } catch (e) {
        // Not a valid URL, don't set label
      }
    }
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
    toastError("Deliverable deleted", `"${deliverableName}" has been removed from this project`, {
      onUndo: handleUndoDelete,
      projectColor: "#ea384c" // Red for deletion
    });
  };
  
  const handleUndoDelete = () => {
    if (lastDeletedDeliverable) {
      toastSuccess("Deletion undone", `"${lastDeletedDeliverable.name}" has been restored`, {
        projectColor: "#9b87f5"
      });
      setLastDeletedDeliverable(null);
    }
  };

  // Calculate total progress for all deliverables
  const totalDeliverables = project.deliverables.length;
  const approvedDeliverables = project.deliverables.filter(d => d.status === "Approved").length;
  const progressPercentage = totalDeliverables > 0 
    ? Math.round((approvedDeliverables / totalDeliverables) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h3 className="text-lg font-medium">Deliverables</h3>
        {totalDeliverables > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{approvedDeliverables} of {totalDeliverables} approved</span>
            <Badge className={progressPercentage === 100 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
              {progressPercentage}% Complete
            </Badge>
          </div>
        )}
      </div>
      
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
                      <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-100">
                        <a 
                          href={deliverable.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {deliverable.fileUrl.includes('figma.com') ? 'View in Figma' : 
                           deliverable.fileUrl.includes('notion.so') ? 'View in Notion' : 
                           'View Attached File'}
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
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium">No deliverables yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">Add deliverables to track your project progress and manage client expectations.</p>
          <Button 
            className="bg-brand-purple hover:bg-brand-purple-dark"
            onClick={() => toastSuccess("Ready to add", "Click 'Add Deliverable' to create your first deliverable")}
          >
            Add First Deliverable
          </Button>
        </div>
      )}
      
      {/* File Link Dialog */}
      <Dialog open={fileLinkDialogOpen} onOpenChange={setFileLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add File Link</DialogTitle>
            <DialogDescription>
              Add a link to a Figma design, Notion document, or any other relevant file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="fileUrl" className="text-sm font-medium">URL</label>
              <Input 
                id="fileUrl" 
                placeholder="https://figma.com/file/..." 
                value={fileUrl} 
                onChange={(e) => setFileUrl(e.target.value)}
                onPaste={handleURLPaste}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="fileLabel" className="text-sm font-medium">
                Label (Optional)
              </label>
              <Input 
                id="fileLabel" 
                placeholder="Figma Design" 
                value={fileLabel} 
                onChange={(e) => setFileLabel(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFileLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFileLink} className="bg-brand-purple-light hover:bg-brand-purple">
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
