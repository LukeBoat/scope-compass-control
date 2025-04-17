import { useState } from "react";
import { Project, DeliverableStatus, Deliverable } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  ExternalLink,
  Pencil,
  Trash,
  Plus,
  CalendarIcon,
  Lock,
  FileText,
  CheckCircle2
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
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useClientMode } from "@/hooks/useClientMode";
import { useAuth } from "@/hooks/useAuth";
import { DeliverableFeedback } from "@/components/DeliverableFeedback";
import { DeliverableApprovalActions } from "@/components/DeliverableApprovalActions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProjectDeliverablesProps {
  project: Project;
}

export function ProjectDeliverables({ project }: ProjectDeliverablesProps) {
  const { isClientMode } = useClientMode();
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [lastDeletedDeliverable, setLastDeletedDeliverable] = useState<Deliverable | null>(null);
  const [fileLinkDialogOpen, setFileLinkDialogOpen] = useState(false);
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [fileLabel, setFileLabel] = useState("");
  const [deletingDeliverable, setDeletingDeliverable] = useState<{ id: string; name: string } | null>(null);

  // Check if user has permission to perform admin actions
  const canPerformAdminActions = user?.role === 'admin' || user?.role === 'project_owner';
  
  // Check if user has permission to edit deliverables
  const canEditDeliverables = canPerformAdminActions && !isClientMode;

  // Group deliverables by status
  const deliverablesByStatus = {
    "Not Started": project.deliverables.filter(d => d.status === "Not Started"),
    "In Progress": project.deliverables.filter(d => d.status === "In Progress"),
    "Delivered": project.deliverables.filter(d => d.status === "Delivered"),
    "Approved": project.deliverables.filter(d => d.status === "Approved")
  };

  const handleStatusChange = (deliverableId: string, newStatus: DeliverableStatus) => {
    // Find the deliverable to get its name
    const deliverable = project.deliverables.find(d => d.id === deliverableId);
    if (!deliverable) return;

    // Show toast notification with appropriate styling based on the new status
    const statusColors = {
      "Not Started": "bg-gray-100 text-gray-800",
      "In Progress": "bg-blue-100 text-blue-800",
      "Delivered": "bg-yellow-100 text-yellow-800",
      "Approved": "bg-green-100 text-green-800"
    };

    toastSuccess(
      "Status Updated", 
      `"${deliverable.name}" is now ${newStatus}`, 
      {
        projectColor: "#9b87f5",
        duration: 3000
      }
    );
    
    // Special celebration for approval
    if (newStatus === "Approved") {
      toastSuccess(
        "Deliverable Approved! 🎉", 
        "This deliverable has been marked as approved.",
        {
          duration: 4000
        }
      );
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

  const handleEditDeliverable = (deliverable: Deliverable) => {
    // TODO: Implement edit functionality
    console.log("Edit deliverable:", deliverable);
  };

  const handleDeleteDeliverable = (deliverableId: string, deliverableName: string) => {
    setDeletingDeliverable({ id: deliverableId, name: deliverableName });
  };

  const handleConfirmDelete = () => {
    if (!deletingDeliverable) return;
    
    // Find the deliverable to store for potential undo
    const deliverableToDelete = project.deliverables.find(d => d.id === deletingDeliverable.id) || null;
    setLastDeletedDeliverable(deliverableToDelete);
    
    // Show toast with undo option
    toastError("Deliverable deleted", `"${deletingDeliverable.name}" has been removed from this project`, {
      onUndo: handleUndoDelete,
      projectColor: "#ea384c" // Red for deletion
    });
    
    setDeletingDeliverable(null);
  };

  const handleUndoDelete = () => {
    if (lastDeletedDeliverable) {
      toastSuccess("Deletion undone", `"${lastDeletedDeliverable.name}" has been restored`, {
        projectColor: "#9b87f5"
      });
      setLastDeletedDeliverable(null);
    }
  };

  const handleAddComment = async (deliverableId: string, comment: string) => {
    // TODO: Implement add comment functionality
    console.log("Add comment:", deliverableId, comment);
  };

  const handleAddAttachment = async (deliverableId: string, file: File) => {
    // TODO: Implement add attachment functionality
    console.log("Add attachment:", deliverableId, file);
    return { name: file.name, url: URL.createObjectURL(file) };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getApprovalStatusBadge = (deliverable: Deliverable) => {
    const getLastFeedback = () => {
      if (!deliverable.feedback || deliverable.feedback.length === 0) return null;
      const lastFeedback = deliverable.feedback[deliverable.feedback.length - 1];
      return {
        author: lastFeedback.author,
        date: new Date(lastFeedback.createdAt).toLocaleDateString()
      };
    };

    const lastFeedback = getLastFeedback();
    const tooltipContent = lastFeedback 
      ? `Last feedback by ${lastFeedback.author} on ${lastFeedback.date}`
      : "No feedback yet";

    switch (deliverable.approvalStatus) {
      case "Approved":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  🟢 Approved
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{tooltipContent}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "Pending":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  🟡 Pending
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{tooltipContent}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "Changes Requested":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  🔴 Changes Requested
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{tooltipContent}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return null;
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
      {project.deliverables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-brand-purple/10 p-4 mb-4">
            <FileText className="h-8 w-8 text-brand-purple" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Deliverables Yet</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Start tracking your project progress by adding deliverables. Each deliverable represents a key milestone or output in your project.
          </p>
          {canEditDeliverables && (
            <Button onClick={() => setShowAddDialog(true)} className="bg-brand-purple hover:bg-brand-purple-dark">
              <Plus className="h-4 w-4 mr-2" />
              Add First Deliverable
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deliverables</CardTitle>
              <CardDescription>
                {isClientMode 
                  ? "Review and approve project deliverables"
                  : "Track and manage project deliverables"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence>
                  {project.deliverables.map((deliverable) => (
                    <motion.div
                      key={deliverable.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h3 className="font-semibold">{deliverable.name}</h3>
                              {!isClientMode && (
                                <p className="text-sm text-muted-foreground">{deliverable.description}</p>
                              )}
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarIcon className="h-4 w-4" />
                                <span>Due {formatDate(deliverable.dueDate)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(deliverable.status)}
                              {getApprovalStatusBadge(deliverable)}
                              {deliverable.feedback && deliverable.feedback.length > 0 && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  💬 {deliverable.feedback.length}
                                </Badge>
                              )}
                              {canEditDeliverables ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="rounded-full p-1 hover:bg-muted"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </motion.button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditDeliverable(deliverable)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteDeliverable(deliverable.id, deliverable.name)}>
                                      <Trash className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="rounded-full p-1 text-muted-foreground">
                                        <Lock className="h-4 w-4" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Only team members can edit deliverables</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                          {isClientMode && (
                            <div className="mt-4 space-y-4">
                              <DeliverableFeedback 
                                deliverable={deliverable}
                                onAddComment={handleAddComment}
                                onAddAttachment={handleAddAttachment}
                              />
                              <DeliverableApprovalActions 
                                deliverable={deliverable}
                                onApprove={async (deliverableId) => {
                                  // Handle approval
                                  console.log("Approve deliverable:", deliverableId);
                                }}
                                onReject={async (deliverableId, feedback) => {
                                  // Handle rejection
                                  console.log("Reject deliverable:", deliverableId, feedback);
                                }}
                                isClientPortal={isClientMode}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
            {canEditDeliverables && (
              <CardFooter>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Deliverable
                  </Button>
                </motion.div>
              </CardFooter>
            )}
          </Card>
        </div>
      )}
      
      {/* File Link Dialog - Only visible to users with edit permissions */}
      {canEditDeliverables && (
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
      )}

      {/* Delete Confirmation Dialog - Only visible to users with edit permissions */}
      {canEditDeliverables && (
        <DeleteConfirmationDialog
          isOpen={!!deletingDeliverable}
          onClose={() => setDeletingDeliverable(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Deliverable"
          description="Are you sure you want to delete this deliverable? This action cannot be undone."
          itemName={deletingDeliverable?.name || ""}
        />
      )}
    </div>
  );
}
