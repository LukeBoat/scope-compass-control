import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProjectMilestones } from "@/components/ProjectMilestones";
import { ProjectTimeline } from "@/components/ProjectTimeline";
import { ScopeChangeTracker } from "@/components/ScopeChangeTracker";
import { Project } from "@/types";
import { useNavigate, useLocation } from "react-router-dom";

interface ProjectTabsProps {
  projectId: string;
  project: Project;
  deliverables: { id: string; name: string }[];
}

export function ProjectTabs({ projectId, project, deliverables }: ProjectTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.hash.replace("#", "") || "milestones";

  const handleTabChange = (value: string) => {
    navigate(`#${value}`, { replace: true });
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
      <TabsList className="grid grid-cols-4 gap-4 p-1">
        <TabsTrigger value="milestones" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
          Milestones
        </TabsTrigger>
        <TabsTrigger value="timeline" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
          Timeline
        </TabsTrigger>
        <TabsTrigger value="scope" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
          Scope Changes
        </TabsTrigger>
        <TabsTrigger value="invoices" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
          Invoices
        </TabsTrigger>
      </TabsList>

      <TabsContent value="milestones" className="space-y-4">
        <ProjectMilestones projectId={projectId} />
      </TabsContent>

      <TabsContent value="timeline" className="space-y-4">
        <ProjectTimeline projectId={projectId} />
      </TabsContent>

      <TabsContent value="scope" className="space-y-4">
        <ScopeChangeTracker projectId={projectId} deliverables={deliverables} />
      </TabsContent>

      <TabsContent value="invoices" className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Project Invoices</h3>
          <p className="text-gray-600">
            View and manage invoices for this project. Track payments, send reminders, and generate new invoices.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
} 