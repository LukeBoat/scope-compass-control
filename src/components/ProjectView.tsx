import { useProject } from "@/hooks/useProject";
import { ProjectInfo } from "@/components/ProjectInfo";
import { ProjectTabs } from "@/components/ProjectTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { NavigationBreadcrumb } from "./NavigationBreadcrumb";
import { ProjectLoading } from "@/components/ProjectLoading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProjectViewProps {
  projectId: string;
}

export function ProjectView({ projectId }: ProjectViewProps) {
  const { project, loading, error } = useProject(projectId);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-4">
        <NavigationBreadcrumb />
        <ProjectLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <NavigationBreadcrumb />
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <NavigationBreadcrumb />
        <div>Project not found</div>
      </div>
    );
  }

  // Get all deliverables from the project
  const deliverables = project.deliverables?.map(deliverable => ({
    id: deliverable.id,
    name: deliverable.name
  })) || [];

  return (
    <div className="space-y-4">
      <NavigationBreadcrumb />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Projects</span>
          </Button>
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
            {project.status}
          </Badge>
        </div>
      </div>
      <ProjectTabs project={project} />
    </div>
  );
} 