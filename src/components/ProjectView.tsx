import { useProject } from "@/hooks/useProject";
import { ProjectInfo } from "@/components/ProjectInfo";
import { ProjectTabs } from "@/components/ProjectTabs";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectViewProps {
  projectId: string;
}

export function ProjectView({ projectId }: ProjectViewProps) {
  const { project, loading, error } = useProject(projectId);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (error || !project) {
    return <div>Error loading project</div>;
  }

  // Get all deliverables from the project
  const deliverables = project.deliverables?.map(deliverable => ({
    id: deliverable.id,
    name: deliverable.name
  })) || [];

  return (
    <div className="space-y-6">
      <ProjectInfo projectId={projectId} />
      <ProjectTabs 
        projectId={projectId}
        project={project}
        deliverables={deliverables}
      />
    </div>
  );
} 