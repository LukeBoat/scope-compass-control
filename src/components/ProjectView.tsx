import { useProject } from "@/hooks/useProject";
import { ProjectInfo } from "@/components/ProjectInfo";
import { ProjectTabs } from "@/components/ProjectTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ProjectViewProps {
  projectId: string;
}

export function ProjectView({ projectId }: ProjectViewProps) {
  const { project, loading, error } = useProject(projectId);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || "Failed to load project details"}
        </AlertDescription>
      </Alert>
    );
  }

  if (!project) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>
          Project not found or you don't have access to it.
        </AlertDescription>
      </Alert>
    );
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