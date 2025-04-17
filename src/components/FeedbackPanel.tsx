import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useClientMode } from "@/hooks/useClientMode";
import { useFeedback } from "@/hooks/useFeedback";
import { MessageSquare, CheckCircle, AlertCircle, ExternalLink, Send, Tag, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Feedback, Deliverable } from "@/types";

interface FeedbackPanelProps {
  deliverable: Deliverable | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackPanel({ deliverable, isOpen, onClose }: FeedbackPanelProps) {
  const [feedbackContent, setFeedbackContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();
  const { isClientMode } = useClientMode();
  const { addFeedback, updateFeedbackStatus, resolveFeedback, isSubmitting } = useFeedback();

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim() || !deliverable) return;

    try {
      await addFeedback(deliverable.id, feedbackContent, "info", selectedTags);
      setFeedbackContent("");
      setSelectedTags([]);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const handleStatusUpdate = async (feedbackId: string, status: Feedback["status"]) => {
    if (!deliverable) return;
    try {
      await updateFeedbackStatus(deliverable.id, feedbackId, status);
    } catch (error) {
      console.error("Failed to update feedback status:", error);
    }
  };

  const handleResolve = async (feedbackId: string) => {
    if (!deliverable) return;
    try {
      await resolveFeedback(deliverable.id, feedbackId);
    } catch (error) {
      console.error("Failed to resolve feedback:", error);
    }
  };

  const getStatusBadge = (status?: Feedback["status"]) => {
    if (!status) return null;

    const variants = {
      info: { icon: MessageSquare, color: "bg-blue-100 text-blue-800" },
      approved: { icon: CheckCircle, color: "bg-green-100 text-green-800" },
      "change-requested": { icon: AlertCircle, color: "bg-yellow-100 text-yellow-800" },
    };

    const { icon: Icon, color } = variants[status];

    return (
      <Badge variant="outline" className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace("-", " ")}
      </Badge>
    );
  };

  const getAuthorInitials = (author: string) => {
    return author.charAt(0).toUpperCase();
  };

  const availableTags = ["bug", "feature", "design", "content", "technical"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Feedback for {deliverable?.name}</span>
            {deliverable?.status && (
              <Badge variant="outline" className="ml-2">
                {deliverable.status}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Review and manage feedback for this deliverable
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feedback Thread */}
          <div className="space-y-4">
            {deliverable?.feedback && deliverable.feedback.length > 0 ? (
              <AnimatePresence>
                {deliverable.feedback.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-8 w-8">
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                          {getAuthorInitials(item.author)}
                        </div>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{item.author}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(item.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          {getStatusBadge(item.status)}
                          {item.role === "client" && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800">
                              Client
                            </Badge>
                          )}
                          {item.resolved && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{item.content}</p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {!item.resolved && (
                          <div className="flex gap-2 mt-2">
                            {isClientMode ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(item.id, "approved")}
                                  disabled={isSubmitting}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(item.id, "change-requested")}
                                  disabled={isSubmitting}
                                >
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  Request Changes
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolve(item.id)}
                                disabled={isSubmitting}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {index < deliverable.feedback.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No feedback yet</p>
              </div>
            )}
          </div>

          {/* File Preview */}
          {deliverable?.fileUrl && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <ExternalLink className="h-4 w-4" />
              <a 
                href={deliverable.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View attached file
              </a>
            </div>
          )}

          {/* Feedback Input */}
          {!isClientMode && (
            <div className="space-y-4">
              <Separator />
              <Textarea
                placeholder="Leave feedback, request changes, or approve..."
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                className="min-h-[100px]"
                required
              />
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting || !feedbackContent.trim()}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Feedback
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 