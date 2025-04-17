import { useProjects } from "@/hooks/useProjects";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

export function ProjectsPage() {
  const { projects, isLoading } = useProjects();
  
  // Set page title
  usePageTitle("Projects");

  const handleCreateProject = () => {
    // TODO: Implement project creation
    console.log("Create project");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Projects</h1>
          <Button onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
        
        <EmptyState
          icon={FolderPlus}
          title="No projects yet"
          description="Create your first project to start tracking deliverables and milestones."
          action={{
            label: "Create Project",
            onClick: handleCreateProject,
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Existing projects list rendering code */}
    </div>
  );
} 