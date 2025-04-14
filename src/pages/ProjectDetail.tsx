import { useProjectContext } from "@/contexts/ProjectContext";
import { ProjectView } from "@/components/ProjectView";
import { ProjectTabs } from "@/components/ProjectTabs";
import { ProjectMilestones } from "@/components/ProjectMilestones";
import { ProjectTimeline } from "@/components/ProjectTimeline";
import { ScopeChangeTracker } from "@/components/ScopeChangeTracker";
import { ClientFeedbackView } from "@/components/ClientFeedbackView";
import { DeliverableDrawer } from "@/components/DeliverableDrawer";
import { useState, useEffect } from "react";
import { Deliverable } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export default function ProjectDetail() {
  const { project, loading, error } = useProjectContext();
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const navigate = useNavigate();

  // Redirect to home if project is not found after loading
  useEffect(() => {
    if (!loading && !project) {
      navigate("/", { replace: true });
    }
  }, [loading, project, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6" role="status" aria-label="Loading project details">
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
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || "Failed to load project details. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!project) {
    return null; // Will be redirected by useEffect
  }

  // Get all deliverables from the project
  const deliverables = project.deliverables?.map(deliverable => ({
    id: deliverable.id,
    name: deliverable.name
  })) || [];

  return (
    <div className="container mx-auto p-6">
      <ProjectView projectId={project.id} />
      <ProjectTabs 
        projectId={project.id}
        project={project}
        deliverables={deliverables}
      />

      {selectedDeliverable && (
        <DeliverableDrawer
          deliverable={selectedDeliverable}
          isOpen={!!selectedDeliverable}
          onClose={() => setSelectedDeliverable(null)}
          onApprove={async (deliverableId, comment) => {
            // Handle approval
            console.log("Approve deliverable:", deliverableId, comment);
          }}
          onAddComment={async (deliverableId, comment) => {
            // Handle adding comment
            console.log("Add comment:", deliverableId, comment);
          }}
          onAddAttachment={async (deliverableId, file) => {
            // Handle adding attachment
            console.log("Add attachment:", deliverableId, file);
            return { name: file.name, url: URL.createObjectURL(file) };
          }}
          onUpdateStatus={async (deliverableId, status) => {
            // Handle status update
            console.log("Update status:", deliverableId, status);
          }}
          onRequestFeedback={async (deliverableId, clientEmail, message) => {
            // Handle feedback request
            console.log("Request feedback:", deliverableId, clientEmail, message);
          }}
          onReopenForEdit={async (deliverableId) => {
            // Handle reopening for edit
            console.log("Reopen for edit:", deliverableId);
          }}
        />
      )}
    </div>
  );
} 