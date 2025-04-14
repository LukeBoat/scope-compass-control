import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, CheckCircle, Smile, X, MessageSquare, AlertCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Deliverable, Feedback } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeliverableFeedbackProps {
  deliverable: Deliverable;
  isApproved: boolean;
  onApprove: (deliverableId: string, comment?: string) => void;
  onAddComment: (deliverableId: string, comment: Partial<Feedback>) => void;
  onAddAttachment: (deliverableId: string, file: File) => Promise<{ name: string; url: string }>;
}

export function DeliverableFeedback({
  deliverable,
  isApproved,
  onApprove,
  onAddComment,
  onAddAttachment
}: DeliverableFeedbackProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalComment, setApprovalComment] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Scroll to bottom when new comments are added
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

      const comment: Partial<Feedback> = {
        content: newComment.trim(),
        author: "Current User", // This should be replaced with actual user info
        createdAt: new Date().toISOString(),
      };

      await onAddComment(deliverable.id, comment);
      setNewComment("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Failed to add comment:", error);
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
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {deliverable.feedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No feedback yet. Be the first to comment!</p>
            </div>
          ) : (
            deliverable.feedback.map((feedback, index) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {feedback.author.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{feedback.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(feedback.createdAt), "MMM d, yyyy h:mm a")}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm">{feedback.content}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4 space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add your feedback..."
              className="min-h-[80px]"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4 mr-1" />
                  Attach
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Paperclip className="h-3 w-3" />
                    {selectedFile.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <Button
                type="button"
                onClick={handleSubmitComment}
                disabled={isSubmitting || (!newComment.trim() && !selectedFile)}
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Deliverable</DialogTitle>
            <DialogDescription>
              Add an optional comment with your approval.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={approvalComment}
            onChange={(e) => setApprovalComment(e.target.value)}
            placeholder="Optional approval comment..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 