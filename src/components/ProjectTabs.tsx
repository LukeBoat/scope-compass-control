import { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProjectMilestones } from "@/components/ProjectMilestones";
import { ProjectTimeline } from "@/components/ProjectTimeline";
import { ScopeChangeTracker } from "@/components/ScopeChangeTracker";
import { ActivityLog } from "@/components/ActivityLog";
import { Project } from "@/types";
import { useNavigate, useLocation } from "react-router-dom";
import ProjectInvoices from "@/pages/ProjectInvoices";

interface ProjectTabsProps {
  projectId: string;
  project: Project;
  deliverables: { id: string; name: string }[];
}

export function ProjectTabs({ projectId, project, deliverables }: ProjectTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const tabsRef = useRef<HTMLDivElement>(null);
  const currentTab = location.pathname.endsWith("/invoices") ? "invoices" : 
                    location.pathname.endsWith("/timeline") ? "timeline" :
                    location.pathname.endsWith("/scope") ? "scope" :
                    location.pathname.endsWith("/activity") ? "activity" : "milestones";

  const scrollToTop = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleTabChange = (value: string) => {
    scrollToTop();
    switch (value) {
      case "invoices":
        navigate("invoices");
        break;
      case "timeline":
        navigate("timeline");
        break;
      case "scope":
        navigate("scope");
        break;
      case "activity":
        navigate("activity");
        break;
      default:
        navigate(".");
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [location.pathname]);

  return (
    <div ref={tabsRef}>
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid grid-cols-5 gap-4 p-1">
          <TabsTrigger value="milestones" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
            Milestones
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="scope" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
            Scope Changes
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
            Activity
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

        <TabsContent value="activity" className="space-y-4">
          <ActivityLog project={project} />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <ProjectInvoices />
        </TabsContent>
      </Tabs>
    </div>
  );
} 