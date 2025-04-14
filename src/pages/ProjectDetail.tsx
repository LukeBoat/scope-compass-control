import { useParams } from "react-router-dom";
import { useProject } from "@/hooks/useProject";
import { ProjectView } from "@/components/ProjectView";
import { ProjectTabs } from "@/components/ProjectTabs";
import { ProjectMilestones } from "@/components/ProjectMilestones";
import { ProjectTimeline } from "@/components/ProjectTimeline";
import { ScopeChangeTracker } from "@/components/ScopeChangeTracker";
import { ClientFeedbackView } from "@/components/ClientFeedbackView";
import ProjectInvoices from "@/pages/ProjectInvoices";
import { DeliverableDrawer } from "@/components/DeliverableDrawer";
import { useState } from "react";
import { Deliverable } from "@/types";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { project, loading, error } = useProject(projectId || '');
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error loading project</div>
      </div>
    );
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