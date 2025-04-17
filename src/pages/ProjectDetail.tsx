import { useParams } from "react-router-dom";
import { useProject } from "@/hooks/useProject";
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
import ProjectNotFound from "@/components/ProjectNotFound";
import LoadingFallback from "@/components/LoadingFallback";
import ProjectHeader from "@/components/ProjectHeader";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { project, loading, error } = useProject(projectId || "");
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  
  // Set page title based on project name
  usePageTitle(project?.name || "Loading Project");

  // Update document title when project is loaded
  useEffect(() => {
    if (project) {
      document.title = `${project.name} | Scope Sentinel`;
    } else {
      document.title = "Scope Sentinel";
    }
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = "Scope Sentinel";
    };
  }, [project]);

  if (loading) {
    return <LoadingFallback />;
  }

  if (error || !project) {
    return <ProjectNotFound projectId={projectId} />;
  }

  // Get all deliverables from the project with defensive check
  const deliverables = project.deliverables?.map(deliverable => ({
    id: deliverable.id,
    name: deliverable.name
  })) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <ProjectHeader project={project} />
      <main className="flex-1 container py-6">
        <ProjectTabs project={project} />

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
      </main>
    </div>
  );
} 