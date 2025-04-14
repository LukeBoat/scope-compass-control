import { useState } from "react";
import { Project, Deliverable } from "@/types";
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
import { X, Info, FileCheck, PlusCircle, RotateCcw } from "lucide-react";
import { ProjectInfo } from "./ProjectInfo";
import { ProjectRevisions } from "./ProjectRevisions";
import { ProjectDeliverables } from "./ProjectDeliverables";
import { toastSuccess } from "./ToastNotification";

interface ProjectDrawerProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

export function ProjectDrawer({ project, open, onClose }: ProjectDrawerProps) {
  const [activeTab, setActiveTab] = useState("info");

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
    toastSuccess("New deliverable added", "Your deliverable has been created successfully");
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
            <p className="text-muted-foreground">{project.clientName}</p>
            <div className="flex items-center gap-3 mt-3">
              <Progress 
                value={project.progress} 
                className="h-2 w-60 bg-gray-100" 
                indicatorClassName="bg-brand-purple"
              />
              <span className="text-sm font-medium">{project.progress}% complete</span>
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
    </Drawer>
  );
}
