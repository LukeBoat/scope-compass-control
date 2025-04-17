import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Send, Paperclip, CheckCircle, X, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Deliverable, DeliverableFeedback } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface ClientFeedbackViewProps {
  deliverable: Deliverable;
  onApprove: (deliverableId: string, comment?: string) => void;
  onRequestChanges: (deliverableId: string, comment: string) => void;
  onAddComment: (deliverableId: string, comment: any) => void;
  onAddAttachment: (deliverableId: string, file: File) => Promise<{ name: string; url: string }>;
  clientName: string;
  clientEmail: string;
}

export function ClientFeedbackView({
  deliverable,
  onApprove,
  onRequestChanges,
  onAddComment,
  onAddAttachment,
  clientName,
  clientEmail
}: ClientFeedbackViewProps) {
  const [comments, setComments] = useState<DeliverableFeedback[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const [approvalComment, setApprovalComment] = useState("");
  const [changesComment, setChangesComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Load existing feedback
  useEffect(() => {
    setComments(deliverable.feedback || []);
  }, [deliverable.feedback]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() && !selectedFile) return;

    setIsSubmitting(true);
    try {
      let attachments = [];
      if (selectedFile) {
        const attachment = await onAddAttachment(deliverable.id, selectedFile);
        attachments.push(attachment);
      }

      const comment: Partial<DeliverableFeedback> = {
        content: newComment.trim(),
        attachments,
        createdAt: new Date().toISOString(),
        userId: "client",
        userName: clientName,
        userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=random`
      };

      await onAddComment(deliverable.id, comment);
      setNewComment("");
      setSelectedFile(null);
      
      toast({
        title: "Feedback Added",
        description: "Your feedback has been added to the deliverable.",
      });
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleApprove = () => {
    onApprove(deliverable.id, approvalComment.trim() || undefined);
    setShowApprovalDialog(false);
    setApprovalComment("");
    
    toast({
      title: "Deliverable Approved",
      description: "The deliverable has been marked as approved.",
    });
  };

  const handleRequestChanges = () => {
    onRequestChanges(deliverable.id, changesComment.trim());
    setShowChangesDialog(false);
    setChangesComment("");
    
    toast({
      title: "Changes Requested",
      description: "Your change request has been submitted.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-500/10 text-green-500";
      case "approved":
        return "bg-blue-500/10 text-blue-500";
      case "pending feedback":
        return "bg-yellow-500/10 text-yellow-500";
      case "changes requested":
        return "bg-orange-500/10 text-orange-500";
      case "in progress":
        return "bg-purple-500/10 text-purple-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{deliverable.name}</h1>
            <Badge variant="outline" className={getStatusColor(deliverable.status)}>
              {deliverable.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Description</h3>
              <p className="text-sm text-muted-foreground">
                {deliverable.notes || "No description provided."}
              </p>
            </div>

            {deliverable.fileUrl && (
              <div>
                <h3 className="text-sm font-medium mb-1">Attachments</h3>
                <a
                  href={deliverable.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Paperclip className="h-4 w-4" />
                  View attached file
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">Feedback & Comments</h2>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No feedback yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((feedback, index) => (
                  <motion.div
                    key={feedback.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {feedback.userName.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{feedback.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(feedback.createdAt), "MMM d, yyyy h:mm a")}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm">{feedback.content}</p>
                        {feedback.attachments && feedback.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {feedback.attachments.map(attachment => (
                              <a
                                key={attachment.url}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <Paperclip className="h-3 w-3" />
                                {attachment.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {index < comments.length - 1 && <Separator className="my-4" />}
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="w-full space-y-4">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            
            <div className="flex items-center gap-2">
              <Input
                type="file"
                id="attachment"
                className="hidden"
                onChange={handleFileChange}
              />
              <Label
                htmlFor="attachment"
                className="cursor-pointer"
              >
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </Label>
              
              <Button
                onClick={handleSubmitComment}
                disabled={isSubmitting || (!newComment.trim() && !selectedFile)}
                className="ml-auto"
              >
                Send
              </Button>
            </div>
            
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Paperclip className="h-4 w-4" />
                <span className="truncate">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setSelectedFile(null)}
                >
                  <AlertCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      <div className="flex gap-4">
        <Button
          variant="default"
          size="lg"
          className="flex-1"
          onClick={() => setShowApprovalDialog(true)}
          disabled={deliverable.status === "Approved"}
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Approve Deliverable
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() => setShowChangesDialog(true)}
          disabled={deliverable.status === "Changes Requested"}
        >
          <X className="h-5 w-5 mr-2" />
          Request Changes
        </Button>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Deliverable</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this deliverable? You can still provide feedback below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="approval-comment">Comment (optional)</Label>
            <Textarea
              id="approval-comment"
              placeholder="Add any final comments..."
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Please provide details about what changes you'd like to see.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="changes-comment">Changes Required</Label>
            <Textarea
              id="changes-comment"
              placeholder="Describe the changes needed..."
              value={changesComment}
              onChange={(e) => setChangesComment(e.target.value)}
              className="mt-2"
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestChanges}>
              Submit Changes Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 