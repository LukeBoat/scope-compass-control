import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectMilestones } from "./ProjectMilestones";
import { ScopeChangeTracker } from "./ScopeChangeTracker";
import { ProjectDeliverables } from "./ProjectDeliverables";
import { ProjectTimeline } from "./ProjectTimeline";
import { Project } from "@/types";

interface ProjectTabsProps {
  projectId: string;
  project: Project;
  deliverables: { id: string; name: string }[];
}

export function ProjectTabs({ projectId, project, deliverables }: ProjectTabsProps) {
  // Extract all revisions from deliverables
  const allRevisions = project.deliverables?.flatMap(deliverable => 
    deliverable.revisions.map(revision => ({
      ...revision,
      deliverableId: deliverable.id
    }))
  ) || [];

  // Handle timeline item click
  const handleTimelineItemClick = (item: { type: "milestone" | "deliverable" | "revision"; id: string }) => {
    // This would open a drawer with details about the clicked item
    console.log("Timeline item clicked:", item);
    // In a real implementation, you would open a drawer or navigate to the item
  };

  return (
    <Tabs defaultValue="milestones" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="milestones">Milestones</TabsTrigger>
        <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="scope-changes">Scope Changes</TabsTrigger>
      </TabsList>
      <TabsContent value="milestones">
        <ProjectMilestones projectId={projectId} />
      </TabsContent>
      <TabsContent value="deliverables">
        <ProjectDeliverables project={project} />
      </TabsContent>
      <TabsContent value="timeline">
        <ProjectTimeline 
          projectId={projectId}
          milestones={project.milestones || []}
          deliverables={project.deliverables || []}
          revisions={allRevisions}
          onItemClick={handleTimelineItemClick}
        />
      </TabsContent>
      <TabsContent value="scope-changes">
        <ScopeChangeTracker projectId={projectId} deliverables={deliverables} />
      </TabsContent>
    </Tabs>
  );
} 