import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FolderX } from "lucide-react";
import { toastError } from "./ToastNotification";

interface ProjectNotFoundProps {
  projectId?: string;
  showBackButton?: boolean;
}

export default function ProjectNotFound({
  projectId,
  showBackButton = true
}: ProjectNotFoundProps) {
  const navigate = useNavigate();

  // Show error toast when component mounts
  React.useEffect(() => {
    toastError(
      "Project Not Found",
      projectId 
        ? `The project with ID "${projectId}" could not be found.`
        : "The requested project could not be found."
    );
  }, [projectId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="rounded-full bg-destructive/10 p-6 mb-6">
        <FolderX className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        {projectId 
          ? `The project you're looking for (ID: ${projectId}) doesn't exist or has been deleted.`
          : "The project you're looking for doesn't exist or has been deleted."}
      </p>
      {showBackButton && (
        <div className="flex gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/projects")}
          >
            View All Projects
          </Button>
        </div>
      )}
    </div>
  );
} 