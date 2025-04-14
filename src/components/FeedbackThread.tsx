import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, CheckCircle, Smile, X, MessageSquare, AlertCircle, Tag, Reply, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeliverableFeedback } from "@/types";

interface FeedbackThreadProps {
  feedback: DeliverableFeedback;
  onReply: (parentId: string, content: string, attachments?: { name: string; url: string }[]) => void;
  onResolve: (feedbackId: string) => void;
  onDelete: (feedbackId: string) => void;
  onEdit: (feedbackId: string, content: string) => void;
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export function FeedbackThread({
  feedback,
  onReply,
  onResolve,
  onDelete,
  onEdit,
  currentUser
}: FeedbackThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(feedback.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isReplying && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [isReplying]);

  const handleReply = async () => {
    if (!replyContent.trim() && !selectedFile) return;

    let attachments = [];
    if (selectedFile) {
      // In a real app, you would upload the file here
      attachments.push({ name: selectedFile.name, url: URL.createObjectURL(selectedFile) });
    }

    await onReply(feedback.id, replyContent.trim(), attachments);
    setReplyContent("");
    setSelectedFile(null);
    setIsReplying(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    await onEdit(feedback.id, editContent.trim());
    setIsEditing(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const canModify = currentUser.id === feedback.userId;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={feedback.userAvatar} />
          <AvatarFallback>
            {feedback.userName.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{feedback.userName}</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(feedback.createdAt), "MMM d, yyyy h:mm a")}
              </span>
            </div>
            {canModify && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}

          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setIsReplying(!isReplying)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onResolve(feedback.id)}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolve
            </Button>
          </div>

          {isReplying && (
            <div className="mt-4 space-y-2">
              <Textarea
                ref={replyInputRef}
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  id={`reply-attachment-${feedback.id}`}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Label
                  htmlFor={`reply-attachment-${feedback.id}`}
                  className="cursor-pointer"
                >
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </Label>
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim() && !selectedFile}
                >
                  Reply
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
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Feedback</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this feedback? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(feedback.id);
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 