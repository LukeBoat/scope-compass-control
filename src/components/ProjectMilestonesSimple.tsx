import { useState } from "react";
import { Project, Milestone } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toastSuccess, toastError } from "./ToastNotification";
import { formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useClientMode } from "@/hooks/useClientMode";
import { useAuth } from "@/hooks/useAuth";
import { Plus, CalendarIcon, CheckCircle, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";

interface ProjectMilestonesSimpleProps {
  project: Project;
}

export function ProjectMilestonesSimple({ project }: ProjectMilestonesSimpleProps) {
  const { isClientMode } = useClientMode();
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    name: "",
    description: "",
    dueDate: "",
    status: "pending"
  });
  const [deletingMilestone, setDeletingMilestone] = useState<{ id: string; name: string } | null>(null);

  // Check if user has permission to perform admin actions
  const canPerformAdminActions = user?.role === 'admin' || user?.role === 'project_owner';
  
  // Check if user has permission to edit milestones
  const canEditMilestones = canPerformAdminActions && !isClientMode;

  const handleAddMilestone = () => {
    if (!newMilestone.name || !newMilestone.dueDate) {
      toastError("Error", "Please fill in all required fields");
      return;
    }

    // TODO: Implement adding milestone to project
    console.log("Add milestone:", newMilestone);
    
    toastSuccess("Milestone added", `"${newMilestone.name}" has been added to this project`, {
      projectColor: "#9b87f5"
    });
    
    setShowAddDialog(false);
    setNewMilestone({
      name: "",
      description: "",
      dueDate: "",
      status: "pending"
    });
  };

  const handleDeleteMilestone = (milestoneId: string, milestoneName: string) => {
    setDeletingMilestone({ id: milestoneId, name: milestoneName });
  };

  const handleConfirmDelete = () => {
    if (!deletingMilestone) return;
    
    // TODO: Implement deleting milestone
    console.log("Delete milestone:", deletingMilestone.id);
    
    toastSuccess("Milestone deleted", `"${deletingMilestone.name}" has been removed from this project`, {
      projectColor: "#9b87f5"
    });
    
    setDeletingMilestone(null);
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>
            {isClientMode 
              ? "Track project milestones and deadlines"
              : "Manage project milestones and deadlines"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {project.milestones.map((milestone) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{milestone.name}</h3>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Due {formatDate(milestone.dueDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(milestone.status)}
                          {canEditMilestones ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteMilestone(milestone.id, milestone.name)}
                            >
                              Delete
                            </Button>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="rounded-full p-1 text-muted-foreground">
                                    <Lock className="h-4 w-4" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Only team members can edit milestones</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
        {canEditMilestones && (
          <CardFooter>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            </motion.div>
          </CardFooter>
        )}
      </Card>
      
      {project.milestones.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium">No milestones yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            {isClientMode 
              ? "No milestones have been added to this project yet."
              : "Add milestones to track your project progress and manage deadlines."
            }
          </p>
          {canEditMilestones && (
            <Button 
              className="bg-brand-purple hover:bg-brand-purple-dark"
              onClick={() => setShowAddDialog(true)}
            >
              Add First Milestone
            </Button>
          )}
        </div>
      )}
      
      {/* Add Milestone Dialog - Only visible to users with edit permissions */}
      {canEditMilestones && (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Milestone</DialogTitle>
              <DialogDescription>
                Create a new milestone to track project progress.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="milestoneName">Name</Label>
                <Input
                  id="milestoneName"
                  placeholder="Project Kickoff" 
                  value={newMilestone.name}
                  onChange={(e) => setNewMilestone({...newMilestone, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milestoneDescription">Description</Label>
                <Textarea
                  id="milestoneDescription"
                  placeholder="Initial project setup and team onboarding" 
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milestoneDueDate">Due Date</Label>
                <Input
                  id="milestoneDueDate"
                  type="date" 
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({...newMilestone, dueDate: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMilestone} className="bg-brand-purple-light hover:bg-brand-purple">
                Add Milestone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog - Only visible to users with edit permissions */}
      {canEditMilestones && (
        <DeleteConfirmationDialog
          isOpen={!!deletingMilestone}
          onClose={() => setDeletingMilestone(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Milestone"
          description="Are you sure you want to delete this milestone? This action cannot be undone."
          itemName={deletingMilestone?.name || ""}
        />
      )}
    </div>
  );
} 