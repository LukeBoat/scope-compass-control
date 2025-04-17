import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, FileText, MessageSquare, History, Send, CheckCircle, AlertCircle, Lock, Unlock, Share2, Copy } from "lucide-react";
import { Deliverable, Feedback } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeliverableFeedback } from "@/components/DeliverableFeedback";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface DeliverableDrawerProps {
  deliverable: Deliverable | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (deliverableId: string, status: Deliverable["status"]) => Promise<void>;
  onRequestFeedback: (deliverableId: string, clientEmail: string, message?: string) => void;
  onReopenForEdit: (deliverableId: string) => void;
  isAdmin?: boolean;
}

export function DeliverableDrawer({
  deliverable,
  isOpen,
  onClose,
  onUpdateStatus,
  onRequestFeedback,
  onReopenForEdit,
  isAdmin = false
}: DeliverableDrawerProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showReopenDialog, setShowReopenDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "In Review":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleUpdateStatus = async (status: Deliverable["status"]) => {
    if (!deliverable) return;
    try {
      await onUpdateStatus(deliverable.id, status);
      toast({
        title: "Status Updated",
        description: `Deliverable status has been updated to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestFeedback = () => {
    onRequestFeedback(deliverable.id, clientEmail, feedbackMessage);
    setShowFeedbackDialog(false);
    setClientEmail("");
    setFeedbackMessage("");
  };

  const handleReopenForEdit = () => {
    onReopenForEdit(deliverable.id);
    setShowReopenDialog(false);
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/view/${deliverable.projectId}/${deliverable.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "The sharing link has been copied to your clipboard.",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && deliverable && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-background border-l shadow-lg z-50"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold truncate">{deliverable.name}</h2>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share deliverable</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <div className="border-b px-4">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="feedback" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Feedback
                  </TabsTrigger>
                  <TabsTrigger value="revisions" className="flex-1">
                    <History className="h-4 w-4 mr-2" />
                    Revisions
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <TabsContent value="details" className="p-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Status</h3>
                    <Badge className={getStatusColor(deliverable.status)}>
                      {deliverable.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Due Date</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(deliverable.dueDate), "PPP")}
                    </p>
                  </div>

                  {deliverable.description && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Description</h3>
                      <p className="text-sm text-muted-foreground">
                        {deliverable.description}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="feedback" className="space-y-4">
                  <DeliverableFeedback
                    deliverable={deliverable}
                    isApproved={deliverable.status === "Approved"}
                    onApprove={async () => {
                      if (!deliverable) return;
                      await handleUpdateStatus("Approved");
                    }}
                    onAddComment={async (content) => {
                      if (!deliverable) return;
                      // Handle adding comment
                    }}
                  />
                </TabsContent>

                <TabsContent value="revisions" className="p-4 space-y-4">
                  {deliverable.revisions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No revisions yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {deliverable.revisions.map((revision) => (
                        <div key={revision.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Version {revision.version}</span>
                            <Badge variant="outline">{revision.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {revision.changes}
                          </p>
                          {revision.files && revision.files.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Files:</h4>
                              <ul className="space-y-1">
                                {revision.files.map((file, index) => (
                                  <li key={index} className="text-sm">
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      {file.name}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Share Dialog */}
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Deliverable</DialogTitle>
                <DialogDescription>
                  Share this deliverable with clients or team members. They will receive a link to view the deliverable.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="share-link">Share Link</Label>
                  <div className="flex gap-2">
                    <Input
                      id="share-link"
                      readOnly
                      value={`${window.location.origin}/view/${deliverable.projectId}/${deliverable.id}`}
                    />
                    <Button variant="outline" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="share-email">Email (optional)</Label>
                  <Input
                    id="share-email"
                    type="email"
                    placeholder="recipient@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="share-message">Message (optional)</Label>
                  <Textarea
                    id="share-message"
                    placeholder="Add a message..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                  Close
                </Button>
                <Button onClick={handleRequestFeedback} disabled={!clientEmail}>
                  Send Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Request Feedback Dialog */}
          <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Feedback</DialogTitle>
                <DialogDescription>
                  Send this deliverable to the client for feedback. They will receive an email with a link to review it.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Client Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="client@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback-message">Message (optional)</Label>
                  <Textarea
                    id="feedback-message"
                    placeholder="Add a message to the client..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRequestFeedback} disabled={!clientEmail}>
                  Send Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reopen for Edit Dialog */}
          <Dialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reopen for Edit</DialogTitle>
                <DialogDescription>
                  Are you sure you want to reopen this approved deliverable for editing? This will change its status back to "In Progress".
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReopenDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReopenForEdit} variant="destructive">
                  Reopen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 