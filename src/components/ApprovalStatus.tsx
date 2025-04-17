import { useState } from "react";
import { CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toastSuccess } from "@/components/ToastNotification";

interface ApprovalStatusProps {
  isApproved: boolean;
  onApprove: (comment?: string) => Promise<void>;
}

export function ApprovalStatus({ isApproved, onApprove }: ApprovalStatusProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    try {
      await onApprove(comment.trim() || undefined);
      setShowDialog(false);
      setComment("");
      toastSuccess(isApproved ? "Revisions requested successfully" : "Deliverable approved successfully");
    } catch (error) {
      console.error("Failed to process approval:", error);
    }
  };

  return (
    <>
      {isApproved ? (
        <Button
          onClick={() => setShowDialog(true)}
          variant="outline"
          className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Request Revisions
        </Button>
      ) : (
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve Deliverable
        </Button>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isApproved ? "Request Revisions" : "Approve Deliverable"}
            </DialogTitle>
            <DialogDescription>
              {isApproved 
                ? "Please provide details about the requested revisions"
                : "Add any comments before approving the deliverable"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isApproved 
                  ? "What revisions are needed?"
                  : "Any final comments?"
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSubmit}>
              {isApproved ? "Request Revisions" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 