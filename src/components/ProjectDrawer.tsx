import { useState, useEffect } from "react";
import { Project, Deliverable, DeliverableStatus } from "@/types";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, Info, FileCheck, PlusCircle, RotateCcw, Receipt, ArrowLeft, Loader2, UserIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProjectInfo } from "./ProjectInfo";
import { ProjectRevisions } from "./ProjectRevisions";
import { ProjectDeliverables } from "./ProjectDeliverables";
import { toastSuccess } from "./ToastNotification";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProjectDrawerSkeleton } from "./ProjectDrawerSkeleton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectDrawerProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

export function ProjectDrawer({ project, open, onClose }: ProjectDrawerProps) {
  const [activeTab, setActiveTab] = useState("info");
  const [showAddDeliverableDialog, setShowAddDeliverableDialog] = useState(false);
  const [newDeliverable, setNewDeliverable] = useState({
    name: "",
    description: "",
    dueDate: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const navigate = useNavigate();

  // Set page title when project is loaded
  usePageTitle(open && project ? `Project: ${project.name}` : null);

  // Reset loading state when drawer opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      // Simulate loading time for project data
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [open]);

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showAddDeliverableDialog) {
          setShowAddDeliverableDialog(false);
        } else if (open) {
          onClose();
        }
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [open, showAddDeliverableDialog, onClose]);

  // Handle tab change with loading state
  const handleTabChange = (value: string) => {
    setIsTabLoading(true);
    setActiveTab(value);
    // Simulate loading time for tab content
    setTimeout(() => {
      setIsTabLoading(false);
    }, 500);
  };

  if (!project && !isLoading) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddDeliverable = () => {
    setShowAddDeliverableDialog(true);
  };

  const handleCreateDeliverable = () => {
    if (!newDeliverable.name) {
      toastSuccess("Error", "Deliverable name is required", {
        projectColor: "#9b87f5"
      });
      return;
    }

    const deliverable: Deliverable = {
      id: `del_${Date.now()}`,
      projectId: project.id,
      name: newDeliverable.name,
      status: "Not Started",
      dueDate: newDeliverable.dueDate || undefined,
      notes: newDeliverable.description,
      milestoneId: "",
      revisions: [],
      isApproved: false,
      feedback: []
    };

    // Here you would typically update the project with the new deliverable
    // For now, we'll just show a success message
    setShowAddDeliverableDialog(false);
    setNewDeliverable({ name: "", description: "", dueDate: "" });
    toastSuccess(
      "New deliverable added", 
      "Your deliverable has been created successfully", 
      {
        projectColor: "#9b87f5"
      }
    );
  };

  const calculateProgress = (project: Project) => {
    if (!project.deliverables?.length) return 0;
    const completed = project.deliverables.filter(d => d.status === 'Approved').length;
    return Math.round((completed / project.deliverables.length) * 100);
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'on hold':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getProjectOwner = () => {
    return project.teamMembers.find(member => member.role === 'owner');
  };

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="h-[95vh] sm:h-[90vh] overflow-hidden flex flex-col">
        {isLoading ? (
          <ProjectDrawerSkeleton />
        ) : (
          <>
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background border-b">
              <DrawerHeader className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={onClose} 
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Projects</span>
                    </Button>
                    <div>
                      <DrawerTitle className="text-xl sm:text-2xl font-bold">{project.name}</DrawerTitle>
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      {getProjectOwner() && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <UserIcon className="h-4 w-4" />
                          <span>Project Owner: {getProjectOwner()?.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DrawerHeader>
              
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium">Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Overall Progress</span>
                          <span className="font-medium">{calculateProgress(project)}%</span>
                        </div>
                        <Progress value={calculateProgress(project)} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Badge variant={getStatusBadgeVariant(project.status)} className="text-sm">
                        {project.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
                
                <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 p-1">
                    <TabsTrigger 
                      value="info"
                      className="relative data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-1 data-[state=active]:after:bg-white data-[state=active]:after:rounded-full transition-all duration-200 data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-brand-blue/20"
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Info
                    </TabsTrigger>
                    <TabsTrigger 
                      value="deliverables"
                      className="relative data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-1 data-[state=active]:after:bg-white data-[state=active]:after:rounded-full transition-all duration-200 data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-brand-blue/20"
                    >
                      <FileCheck className="h-4 w-4 mr-2" />
                      Deliverables
                    </TabsTrigger>
                    <TabsTrigger 
                      value="revisions"
                      className="relative data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-1 data-[state=active]:after:bg-white data-[state=active]:after:rounded-full transition-all duration-200 data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-brand-blue/20"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Revisions
                    </TabsTrigger>
                    <TabsTrigger 
                      value="invoices"
                      className="relative data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-1 data-[state=active]:after:bg-white data-[state=active]:after:rounded-full transition-all duration-200 data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-brand-blue/20"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Invoices
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isTabLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                </div>
              ) : (
                <>
                  <TabsContent value="info" className="mt-0 h-full">
                    <ProjectInfo projectId={project.id} />
                  </TabsContent>
                  <TabsContent value="revisions" className="mt-0 h-full">
                    <ProjectRevisions project={project} />
                  </TabsContent>
                  <TabsContent value="deliverables" className="mt-0 h-full">
                    <ProjectDeliverables project={project} />
                  </TabsContent>
                </>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-10 bg-background border-t">
              <DrawerFooter className="px-6 py-4">
                <div className="flex justify-between w-full">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                  >
                    Close
                  </Button>
                  {activeTab === "deliverables" && (
                    <Button 
                      className="bg-brand-purple hover:bg-brand-purple-dark"
                      onClick={handleAddDeliverable}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Deliverable
                    </Button>
                  )}
                </div>
              </DrawerFooter>
            </div>
          </>
        )}
      </DrawerContent>

      <Dialog 
        open={showAddDeliverableDialog} 
        onOpenChange={setShowAddDeliverableDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Deliverable</DialogTitle>
            <DialogDescription>
              Create a new deliverable for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deliverable-name">Deliverable Name</Label>
              <Input
                id="deliverable-name"
                placeholder="Enter deliverable name"
                value={newDeliverable.name}
                onChange={(e) => setNewDeliverable(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={newDeliverable.dueDate}
                onChange={(e) => setNewDeliverable(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter deliverable description"
                value={newDeliverable.description}
                onChange={(e) => setNewDeliverable(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDeliverableDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDeliverable}>
              Create Deliverable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Drawer>
  );
}
