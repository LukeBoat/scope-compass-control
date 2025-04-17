import { useState, useRef, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProjectMilestones } from "@/components/ProjectMilestones";
import { ProjectTimeline } from "@/components/ProjectTimeline";
import { ScopeChangeTracker } from "@/components/ScopeChangeTracker";
import { ActivityLog } from "@/components/ActivityLog";
import { Project } from "@/types";
import { useNavigate, useLocation } from "react-router-dom";
import ProjectInvoices from "@/pages/ProjectInvoices";
import { debounce } from "lodash";
import { ProjectInfo } from "./ProjectInfo";
import { ProjectDeliverables } from "./ProjectDeliverables";
import { TeamCollaboration } from "./TeamCollaboration";
import { useTeamCollaboration } from "@/hooks/useTeamCollaboration";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectOverview } from "./ProjectOverview";
import { ProjectTeam } from "./ProjectTeam";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface ProjectTabsProps {
  project: Project;
}

export function ProjectTabs({ project }: ProjectTabsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs 
      defaultValue="overview" 
      className="space-y-4"
      onValueChange={handleTabChange}
    >
      <TabsList className="flex flex-wrap gap-2 p-1 sm:grid sm:grid-cols-8 sm:gap-4">
        <TabsTrigger 
          value="overview" 
          className={cn(
            "flex-1 min-w-[120px] transition-all duration-200",
            "data-[state=active]:bg-brand-purple-light data-[state=active]:text-brand-purple",
            "data-[state=active]:shadow-sm data-[state=active]:scale-105",
            "hover:bg-brand-purple-light/50",
            "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "after:bg-brand-purple after:scale-x-0 after:transition-transform after:duration-200",
            "data-[state=active]:after:scale-x-100"
          )}
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="team" 
          className={cn(
            "flex-1 min-w-[120px] transition-all duration-200",
            "data-[state=active]:bg-brand-purple-light data-[state=active]:text-brand-purple",
            "data-[state=active]:shadow-sm data-[state=active]:scale-105",
            "hover:bg-brand-purple-light/50",
            "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "after:bg-brand-purple after:scale-x-0 after:transition-transform after:duration-200",
            "data-[state=active]:after:scale-x-100"
          )}
        >
          Team
        </TabsTrigger>
        <TabsTrigger 
          value="deliverables" 
          className={cn(
            "flex-1 min-w-[120px] transition-all duration-200",
            "data-[state=active]:bg-brand-purple-light data-[state=active]:text-brand-purple",
            "data-[state=active]:shadow-sm data-[state=active]:scale-105",
            "hover:bg-brand-purple-light/50",
            "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "after:bg-brand-purple after:scale-x-0 after:transition-transform after:duration-200",
            "data-[state=active]:after:scale-x-100"
          )}
        >
          Deliverables
        </TabsTrigger>
        <TabsTrigger 
          value="milestones" 
          className={cn(
            "flex-1 min-w-[120px] transition-all duration-200",
            "data-[state=active]:bg-brand-purple-light data-[state=active]:text-brand-purple",
            "data-[state=active]:shadow-sm data-[state=active]:scale-105",
            "hover:bg-brand-purple-light/50",
            "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "after:bg-brand-purple after:scale-x-0 after:transition-transform after:duration-200",
            "data-[state=active]:after:scale-x-100"
          )}
        >
          Milestones
        </TabsTrigger>
        <TabsTrigger 
          value="timeline" 
          className={cn(
            "flex-1 min-w-[120px] transition-all duration-200",
            "data-[state=active]:bg-brand-purple-light data-[state=active]:text-brand-purple",
            "data-[state=active]:shadow-sm data-[state=active]:scale-105",
            "hover:bg-brand-purple-light/50",
            "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "after:bg-brand-purple after:scale-x-0 after:transition-transform after:duration-200",
            "data-[state=active]:after:scale-x-100"
          )}
        >
          Timeline
        </TabsTrigger>
        <TabsTrigger 
          value="scope" 
          className={cn(
            "flex-1 min-w-[120px] transition-all duration-200",
            "data-[state=active]:bg-brand-purple-light data-[state=active]:text-brand-purple",
            "data-[state=active]:shadow-sm data-[state=active]:scale-105",
            "hover:bg-brand-purple-light/50",
            "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "after:bg-brand-purple after:scale-x-0 after:transition-transform after:duration-200",
            "data-[state=active]:after:scale-x-100"
          )}
        >
          Scope Changes
        </TabsTrigger>
        <TabsTrigger 
          value="activity" 
          className={cn(
            "flex-1 min-w-[120px] transition-all duration-200",
            "data-[state=active]:bg-brand-purple-light data-[state=active]:text-brand-purple",
            "data-[state=active]:shadow-sm data-[state=active]:scale-105",
            "hover:bg-brand-purple-light/50",
            "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "after:bg-brand-purple after:scale-x-0 after:transition-transform after:duration-200",
            "data-[state=active]:after:scale-x-100"
          )}
        >
          Activity
        </TabsTrigger>
        <TabsTrigger 
          value="invoices" 
          className={cn(
            "flex-1 min-w-[120px] transition-all duration-200",
            "data-[state=active]:bg-brand-purple-light data-[state=active]:text-brand-purple",
            "data-[state=active]:shadow-sm data-[state=active]:scale-105",
            "hover:bg-brand-purple-light/50",
            "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "after:bg-brand-purple after:scale-x-0 after:transition-transform after:duration-200",
            "data-[state=active]:after:scale-x-100"
          )}
        >
          Invoices
        </TabsTrigger>
      </TabsList>

      {isLoading ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="space-y-2">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-[150px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading content...</span>
            </div>
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <TabsContent value="overview">
            <ProjectOverview project={project} />
          </TabsContent>
          <TabsContent value="team">
            <ProjectTeam project={project} />
          </TabsContent>
          <TabsContent value="deliverables">
            <ProjectDeliverables project={project} />
          </TabsContent>
          <TabsContent value="milestones">
            <ProjectMilestones projectId={project.id} teamMembers={project.teamMembers} />
          </TabsContent>
          <TabsContent value="timeline">
            <ProjectTimeline projectId={project.id} />
          </TabsContent>
          <TabsContent value="scope">
            <ScopeChangeTracker projectId={project.id} deliverables={project.deliverables || []} />
          </TabsContent>
          <TabsContent value="activity">
            <ActivityLog project={project} />
          </TabsContent>
          <TabsContent value="invoices">
            <ProjectInvoices />
          </TabsContent>
        </>
      )}
    </Tabs>
  );
} 