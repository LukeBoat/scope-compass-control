import { useState } from "react";
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
import { X, Info, FileCheck, PlusCircle, RotateCcw, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProjectInfo } from "./ProjectInfo";
import { ProjectRevisions } from "./ProjectRevisions";
import { ProjectDeliverables } from "./ProjectDeliverables";
import { toastSuccess } from "./ToastNotification";
import { Link } from "react-router-dom";

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

  if (!project) return null;

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

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="h-[85vh] max-h-[85vh] rounded-t-xl">
        <div className="mx-auto w-full max-w-5xl">
          <DrawerHeader className="px-6 pt-6 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DrawerTitle className="text-2xl font-semibold">{project.name}</DrawerTitle>
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </DrawerHeader>
          
          <div className="px-6 pb-3">
            <p className="text-muted-foreground">{project.client}</p>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">{project.name}</h2>
                <p className="text-muted-foreground">{project.client}</p>
              </div>
              <Badge variant={getStatusBadgeVariant(project.status)}>
                {project.status}
              </Badge>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{calculateProgress(project)}%</span>
              </div>
              <Progress value={calculateProgress(project)} className="h-2" />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-6">
              <TabsList className="bg-transparent h-auto p-0 w-full justify-start gap-6">
                <TabsTrigger
                  value="info"
                  className="h-12 px-0 font-medium data-[state=active]:border-b-2 data-[state=active]:border-brand-purple rounded-none data-[state=active]:shadow-none"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Project Info
                </TabsTrigger>
                <TabsTrigger
                  value="revisions"
                  className="h-12 px-0 font-medium data-[state=active]:border-b-2 data-[state=active]:border-brand-purple rounded-none data-[state=active]:shadow-none"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Revisions
                </TabsTrigger>
                <TabsTrigger
                  value="deliverables"
                  className="h-12 px-0 font-medium data-[state=active]:border-b-2 data-[state=active]:border-brand-purple rounded-none data-[state=active]:shadow-none"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Deliverables
                </TabsTrigger>
                <Link 
                  to={`/projects/${project.id}/invoices`}
                  className="h-12 px-0 font-medium flex items-center hover:text-brand-purple transition-colors"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Invoices
                </Link>
              </TabsList>
            </div>
            
            <div className="px-6 py-4 flex-1 overflow-auto">
              <TabsContent value="info" className="mt-0 h-full">
                <ProjectInfo project={project} />
              </TabsContent>
              <TabsContent value="revisions" className="mt-0 h-full">
                <ProjectRevisions project={project} />
              </TabsContent>
              <TabsContent value="deliverables" className="mt-0 h-full">
                <ProjectDeliverables project={project} />
              </TabsContent>
            </div>
          </Tabs>

          <DrawerFooter className="px-6 py-4 border-t">
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
      </DrawerContent>

      <Dialog open={showAddDeliverableDialog} onOpenChange={setShowAddDeliverableDialog}>
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
