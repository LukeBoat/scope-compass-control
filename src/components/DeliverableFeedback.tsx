import { useState, useRef, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, CheckCircle, Smile, X, MessageSquare, AlertCircle, Tag, Reply, XCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Deliverable, Feedback, ExtendedFeedback } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeliverableFeedback } from "@/hooks/useDeliverableFeedback";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedToast } from '@/hooks/useDebouncedToast';
import { useActivityLog } from '@/hooks/useActivityLog';
import { formatDate } from '@/lib/utils';

interface DeliverableFeedbackProps {
  projectId: string;
  deliverableId: string;
  feedback: Feedback[];
  onFeedbackSubmit: (content: string) => Promise<void>;
  onApprove: (status: string, comment?: string) => Promise<void>;
  canApprove?: boolean;
  canProvideFeedback?: boolean;
}

export function DeliverableFeedback({
  projectId,
  deliverableId,
  feedback,
  onFeedbackSubmit,
  onApprove,
  canApprove = false,
  canProvideFeedback = true,
}: DeliverableFeedbackProps) {
  const { user } = useAuth();
  const { showToast } = useDebouncedToast();
  const { logFeedback, logApproval } = useActivityLog();
  const [comment, setComment] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!comment.trim()) {
      showToast('Please enter feedback before submitting', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onFeedbackSubmit(comment);
      await logFeedback(projectId, deliverableId, comment);
      setComment('');
      showToast('Feedback submitted successfully');
    } catch (error) {
      showToast('Failed to submit feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (status: string) => {
    if (!approvalComment.trim()) {
      showToast('Please provide a comment for approval', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onApprove(status, approvalComment);
      await logApproval(projectId, deliverableId, status, approvalComment);
      setApprovalComment('');
      showToast(`Deliverable ${status.toLowerCase()} successfully`);
    } catch (error) {
      showToast(`Failed to ${status.toLowerCase()} deliverable`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  // Check if user has permission to provide feedback
  const hasFeedbackPermission = user?.role === 'admin' || user?.role === 'client' || canProvideFeedback;
  
  // Check if user has permission to approve
  const hasApprovalPermission = user?.role === 'admin' || user?.role === 'client' || canApprove;

  return (
    <div className="space-y-4">
      {hasFeedbackPermission ? (
        <div className="space-y-2">
          <Textarea
            placeholder="Add your feedback..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px] w-full resize-none sm:min-h-[120px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitFeedback}
              disabled={!comment.trim() || isSubmitting}
              className="w-full sm:w-auto"
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-gray-500">
          <Lock className="h-4 w-4" />
          <span>You don't have permission to provide feedback</span>
        </div>
      )}

      {hasApprovalPermission && (
        <div className="space-y-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">Approve Deliverable</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Approve Deliverable</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Add a comment for approval..."
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="min-h-[100px] w-full resize-none sm:min-h-[120px]"
                />
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleApprove('rejected')}
                    disabled={!approvalComment.trim() || isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove('approved')}
                    disabled={!approvalComment.trim() || isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    Approve
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="space-y-4">
        {feedback.map((item) => (
          <div key={item.id} className="rounded-lg border p-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  {item.author.avatar ? (
                    <img
                      src={item.author.avatar}
                      alt={item.author.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{item.author.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.author.role} • {formatDate(item.timestamp)}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                {getStatusIcon(item.type)}
              </div>
            </div>
            <p className="mt-2 text-gray-700 break-words">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 