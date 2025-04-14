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
import { Deliverable, DeliverableFeedback } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Comment {
  id: string;
  deliverableId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  attachments?: { name: string; url: string }[];
  tags?: string[];
  createdAt: string;
}

interface DeliverableFeedbackProps {
  deliverable: Deliverable;
  isApproved: boolean;
  onApprove: (deliverableId: string, comment?: string) => void;
  onAddComment: (deliverableId: string, comment: any) => void;
  onAddAttachment: (deliverableId: string, file: File) => Promise<{ name: string; url: string }>;
}

export function DeliverableFeedback({
  deliverable,
  isApproved,
  onApprove,
  onAddComment,
  onAddAttachment
}: DeliverableFeedbackProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newTags, setNewTags] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalComment, setApprovalComment] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mock comments for now - would be fetched from API in real implementation
  useEffect(() => {
    // Simulate loading comments
    const mockComments: Comment[] = [
      {
        id: "1",
        deliverableId: deliverable.id,
        userId: "user1",
        userName: "John Doe",
        userAvatar: "https://github.com/shadcn.png",
        content: "This looks great! Just a few minor tweaks needed.",
        tags: ["feedback"],
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: "2",
        deliverableId: deliverable.id,
        userId: "user2",
        userName: "Jane Smith",
        userAvatar: "https://github.com/shadcn.png",
        content: "I've made the requested changes. Please review.",
        attachments: [{ name: "updated-design.png", url: "#" }],
        tags: ["revision"],
        createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      },
    ];
    setComments(mockComments);
  }, [deliverable.id]);

  // Scroll to bottom when new comments are added
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

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
        tags: newTags.split(",").map(tag => tag.trim()).filter(Boolean),
        createdAt: new Date().toISOString()
      };

      await onAddComment(deliverable.id, comment);
      setNewComment("");
      setNewTags("");
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
    onApprove(deliverable.id, newComment.trim() || undefined);
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
                    <AvatarImage src={feedback.userAvatar} />
                    <AvatarFallback>
                      {feedback.userName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{feedback.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(feedback.createdAt), "MMM d, yyyy h:mm a")}
                        </span>
                      </div>
                      {feedback.tags.length > 0 && (
                        <div className="flex gap-1">
                          {feedback.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm">{feedback.content}</p>
                    {feedback.attachments.length > 0 && (
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
                {index < deliverable.feedback.length - 1 && <Separator className="my-4" />}
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4 space-y-4">
        {!isApproved && (
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Deliverable
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="tags" className="text-xs text-muted-foreground">
                Tags (comma-separated)
              </Label>
              <Input
                id="tags"
                placeholder="feedback, review, etc."
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="h-8"
              />
            </div>
            
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
              >
                Send
              </Button>
            </div>
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
      </div>
    </div>
  );
} 