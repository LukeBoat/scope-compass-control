import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useRevisions } from "@/hooks/useRevisions";
import { useRevisionComments } from "@/hooks/useRevisionComments";
import { Deliverable, Revision } from "@/types";
import { FileUpload } from "./FileUpload";
import { RevisionComments } from "./RevisionComments";
import { RevisionHistory } from "./RevisionHistory";

interface RevisionManagerProps {
  deliverable: Deliverable;
  onUpdateRevision: (revisionId: string, updates: Partial<Revision>) => Promise<void>;
  onAddRevision: (revision: Omit<Revision, "id" | "createdAt">) => Promise<Revision>;
}

export function RevisionManager({ deliverable, onUpdateRevision, onAddRevision }: RevisionManagerProps) {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [changes, setChanges] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);

  const { revisions, loading, error, addRevision, updateRevision } = useRevisions({ deliverableId: deliverable.id });
  const { comments, addComment } = useRevisionComments({ revisionId: selectedRevision?.id || "" });

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleSubmitRevision = async () => {
    try {
      if (!changes.trim()) {
        toast({
          title: "Error",
          description: "Please describe the changes made in this revision",
          variant: "destructive",
        });
        return;
      }

      if (selectedFiles.length === 0) {
        toast({
          title: "Error",
          description: "Please upload at least one file for this revision",
          variant: "destructive",
        });
        return;
      }

      // TODO: Implement file upload to storage
      const uploadedFiles = await Promise.all(
        selectedFiles.map(async (file) => ({
          name: file.name,
          url: "placeholder-url", // Replace with actual uploaded file URL
          type: file.type,
          size: file.size,
        }))
      );

      await addRevision({
        deliverableId: deliverable.id,
        version: `v${revisions.length + 1}`,
        status: "pending",
        date: new Date(),
        changes,
        files: uploadedFiles,
      });

      setChanges("");
      setSelectedFiles([]);
      toast({
        title: "Success",
        description: "Revision submitted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit revision",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (revision: Revision) => {
    try {
      await updateRevision(revision.id, {
        status: "approved",
        approvedBy: "current-user-id", // Replace with actual user ID
        approvedAt: new Date(),
      });
      toast({
        title: "Success",
        description: "Revision approved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve revision",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (revision: Revision) => {
    try {
      if (!rejectionReason.trim()) {
        toast({
          title: "Error",
          description: "Please provide a reason for rejection",
          variant: "destructive",
        });
        return;
      }

      await updateRevision(revision.id, {
        status: "rejected",
        rejectionReason,
        rejectedBy: "current-user-id", // Replace with actual user ID
        rejectedAt: new Date(),
      });

      setRejectionReason("");
      setSelectedRevision(null);
      toast({
        title: "Success",
        description: "Revision rejected successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject revision",
        variant: "destructive",
      });
    }
  };

  const handleMarkFinal = async (revision: Revision) => {
    try {
      await updateRevision(revision.id, {
        status: "final",
        markedFinalBy: "current-user-id", // Replace with actual user ID
        markedFinalAt: new Date(),
      });
      toast({
        title: "Success",
        description: "Revision marked as final",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark revision as final",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading revisions...</div>;
  }

  if (error) {
    return <div>Error loading revisions: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Submit New Revision</h3>
        <div className="space-y-4">
          <Textarea
            placeholder="Describe the changes made in this revision..."
            value={changes}
            onChange={(e) => setChanges(e.target.value)}
            className="min-h-[100px]"
          />
          <FileUpload onFileSelect={handleFileSelect} />
          <Button onClick={handleSubmitRevision} disabled={!changes.trim() || selectedFiles.length === 0}>
            Submit Revision
          </Button>
        </div>
      </Card>

      <RevisionHistory
        revisions={revisions}
        onApprove={handleApprove}
        onReject={(revision) => {
          setSelectedRevision(revision);
          setRejectionReason("");
        }}
        onMarkFinal={handleMarkFinal}
        onSelectRevision={setSelectedRevision}
      />

      {selectedRevision && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Reject Revision</h3>
          <div className="space-y-4">
            <Textarea
              placeholder="Provide a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRevision(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(selectedRevision)}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {selectedRevision && (
        <RevisionComments
          revisionId={selectedRevision.id}
          comments={comments}
          onAddComment={addComment}
        />
      )}
    </div>
  );
} 