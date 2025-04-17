import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useToast } from "./ui/use-toast";
import { useClientMode } from "../hooks/useClientMode";
import { MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Feedback } from "../types";

interface FeedbackThreadProps {
  feedback: Feedback[];
  onAddFeedback?: (content: string) => Promise<void>;
  title?: string;
  showReplyButton?: boolean;
}

export function FeedbackThread({
  feedback,
  onAddFeedback,
  title = "Feedback",
  showReplyButton = true,
}: FeedbackThreadProps) {
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { toast } = useToast();
  const { isClientMode } = useClientMode();

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !onAddFeedback) return;

    setIsSubmitting(true);
    try {
      await onAddFeedback(replyContent);
      setReplyContent("");
      setShowReplyForm(false);
      toast({
        title: "Reply sent",
        description: "Your feedback has been submitted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAuthorInitials = (author: string) => {
    return author.charAt(0).toUpperCase();
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

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {showReplyButton && !isClientMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Reply
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {feedback.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No feedback yet
          </p>
        ) : (
          <div className="space-y-6 px-6 py-4">
            {feedback.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
                    </div>
                    <p className="text-sm">{item.content}</p>
                  </div>
                </div>
                {index < feedback.length - 1 && (
                  <Separator className="my-4" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showReplyForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 space-y-4"
          >
            <Separator />
            <Textarea
              placeholder="Leave feedback, request changes, or approve..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReplyForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReply}
                disabled={isSubmitting || !replyContent.trim()}
              >
                {isSubmitting ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
} 