import { useState } from "react";
import { Project, Revision, Deliverable, RevisionComment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, Plus, MessageSquare, Send } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { toastSuccess, toastWarning } from "./ToastNotification";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { notifications } from "@/lib/notifications";

interface ProjectRevisionsProps {
  project: Project;
}

export function ProjectRevisions({ project }: ProjectRevisionsProps) {
  const [open, setOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<string>("");
  const [revisionNote, setRevisionNote] = useState<string>("");
  const [lastAddedRevision, setLastAddedRevision] = useState<{deliverableId: string, notes: string} | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const { user } = useAuth();

  const getAllRevisions = () => {
    const allRevisions: Array<Revision & { deliverableName: string }> = [];
    
    project.deliverables.forEach(deliverable => {
      deliverable.revisions.forEach(revision => {
        allRevisions.push({
          ...revision,
          deliverableName: deliverable.name
        });
      });
    });
    
    return allRevisions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  const handleAddRevision = async () => {
    if (!selectedDeliverable || !revisionNote.trim()) {
      return;
    }

    setLastAddedRevision({
      deliverableId: selectedDeliverable,
      notes: revisionNote
    });
    
    // Calculate total revisions across all deliverables
    const totalRevisions = project.deliverables.reduce((total, deliverable) => 
      total + deliverable.revisions.length, 0
    );
    
    // Set a default limit of 10 revisions per project
    const REVISION_LIMIT = 10;
    
    if (totalRevisions >= REVISION_LIMIT) {
      toastWarning(
        "Revision limit exceeded", 
        "This project has reached its revision limit. Consider discussing with the client.",
        {
          projectColor: "#f97316"
        }
      );
    } else {
      const deliverableName = project.deliverables.find(d => d.id === selectedDeliverable)?.name || "deliverable";
      
      // Create notification for new revision
      if (user) {
        await notifications.revisionAdded(project.id, user, deliverableName);
      }

      toastSuccess(
        "Revision added", 
        `A new revision has been logged for "${deliverableName}".`,
        {
          onUndo: handleUndoAddRevision,
          projectColor: "#9b87f5"
        }
      );
    }
    
    setOpen(false);
    setSelectedDeliverable("");
    setRevisionNote("");
  };

  const handleUndoAddRevision = () => {
    if (lastAddedRevision) {
      const deliverableName = project.deliverables.find(d => d.id === lastAddedRevision.deliverableId)?.name || "deliverable";
      
      toastSuccess("Revision removed", `The revision for "${deliverableName}" has been removed`, {
        projectColor: "#9b87f5"
      });
      setLastAddedRevision(null);
    }
  };

  const handleAddComment = async (revision: Revision) => {
    if (!commentText.trim()) return;

    const newComment: RevisionComment = {
      id: `comment-${Date.now()}`,
      revisionId: revision.id,
      userId: user?.id || "current-user",
      userName: user?.name || "Current User",
      content: commentText,
      createdAt: new Date().toISOString()
    };

    // Update the revision with the new comment
    const updatedRevision = {
      ...revision,
      comments: [...(revision.comments || []), newComment]
    };

    // Update the project state with the new comment
    const updatedDeliverables = project.deliverables.map(deliverable => ({
      ...deliverable,
      revisions: deliverable.revisions.map(rev => 
        rev.id === revision.id ? updatedRevision : rev
      )
    }));

    // Create notification for new comment
    if (user) {
      const deliverableName = project.deliverables.find(d => 
        d.revisions.some(r => r.id === revision.id)
      )?.name || "deliverable";
      await notifications.commentAdded(project.id, user, `${deliverableName} revision`);
    }

    // Here you would typically make an API call to update the project
    // For now, we'll just show a success message
    toastSuccess(
      "Comment added",
      "Your comment has been added to the revision.",
      {
        projectColor: "#9b87f5"
      }
    );

    setCommentText("");
  };

  const allRevisions = getAllRevisions();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Revisions</h2>
        <Button onClick={() => setOpen(true)}>Add Revision</Button>
      </div>

      {allRevisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-brand-purple/10 p-4 mb-4">
            <RotateCcw className="h-8 w-8 text-brand-purple" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Revisions Yet</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Track changes and improvements by adding revisions to your deliverables.
          </p>
          <Button onClick={() => setOpen(true)}>Add First Revision</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {allRevisions.map((revision) => (
            <Card key={revision.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium">{revision.deliverableName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{revision.notes}</p>
                  
                  {/* Comments Section */}
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <h4 className="text-sm font-medium">Comments</h4>
                    </div>
                    
                    <ScrollArea className="h-[200px] pr-4">
                      {revision.comments?.map((comment) => (
                        <div key={comment.id} className="mb-4">
                          <div className="flex items-start gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{comment.userName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>

                    {/* Add Comment Form */}
                    <div className="flex gap-2">
                      <Textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        onClick={() => handleAddComment(revision)}
                        disabled={!commentText.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="ml-4">{formatDate(revision.date)}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-brand-purple hover:bg-brand-purple-dark">
            <Plus className="h-4 w-4 mr-2" />
            Log Revision
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log a New Revision</DialogTitle>
            <DialogDescription>
              Track a revision to keep count of your scope limits.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Deliverable</label>
              <Select value={selectedDeliverable} onValueChange={setSelectedDeliverable}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a deliverable" />
                </SelectTrigger>
                <SelectContent>
                  {project.deliverables.map((deliverable) => (
                    <SelectItem key={deliverable.id} value={deliverable.id}>
                      {deliverable.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Revision Notes</label>
              <Textarea
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Describe the changes made in this revision"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              className="bg-brand-purple hover:bg-brand-purple-dark"
              onClick={handleAddRevision}
              disabled={!selectedDeliverable || !revisionNote}
            >
              Save Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
