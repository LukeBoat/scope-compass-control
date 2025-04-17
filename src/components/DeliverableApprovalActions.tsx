import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Deliverable } from "@/types";

interface DeliverableApprovalActionsProps {
  deliverable: Deliverable;
  onApprove: (deliverableId: string, feedback?: string) => Promise<void>;
  onReject: (deliverableId: string, feedback: string) => Promise<void>;
  isClientPortal?: boolean;
}

export function DeliverableApprovalActions({
  deliverable,
  onApprove,
  onReject,
  isClientPortal = false
}: DeliverableApprovalActionsProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionFeedback, setRejectionFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Only show actions if deliverable is in "Delivered" status and user is in client portal
  if (deliverable.status !== "Delivered" || !isClientPortal) {
    return null;
  }

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await onApprove(deliverable.id);
      toast({
        title: "Deliverable Approved",
        description: "The deliverable has been marked as approved.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve the deliverable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionFeedback.trim()) {
      toast({
        title: "Error",
        description: "Please provide feedback for rejection.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onReject(deliverable.id, rejectionFeedback);
      setShowRejectDialog(false);
      setRejectionFeedback("");
      toast({
        title: "Deliverable Rejected",
        description: "The deliverable has been rejected with your feedback.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject the deliverable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
            onClick={() => setShowRejectDialog(true)}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            <Check className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </motion.div>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Deliverable</DialogTitle>
            <DialogDescription>
              Please provide feedback explaining why this deliverable needs to be rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter your feedback here..."
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting || !rejectionFeedback.trim()}
            >
              <X className="h-4 w-4 mr-2" />
              Reject Deliverable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 