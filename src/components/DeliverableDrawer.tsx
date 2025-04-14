import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, FileText, MessageSquare, History, Send, CheckCircle, AlertCircle, Lock, Unlock } from "lucide-react";
import { Deliverable } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeliverableFeedback } from "./DeliverableFeedback";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DeliverableDrawerProps {
  deliverable: Deliverable;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (deliverableId: string, comment?: string) => void;
  onAddComment: (deliverableId: string, comment: any) => void;
  onAddAttachment: (deliverableId: string, file: File) => Promise<{ name: string; url: string }>;
  onUpdateStatus: (deliverableId: string, status: string) => void;
  onRequestFeedback: (deliverableId: string, clientEmail: string, message?: string) => void;
  onReopenForEdit: (deliverableId: string) => void;
  isAdmin?: boolean;
}

export function DeliverableDrawer({
  deliverable,
  isOpen,
  onClose,
  onApprove,
  onAddComment,
  onAddAttachment,
  onUpdateStatus,
  onRequestFeedback,
  onReopenForEdit,
  isAdmin = false
}: DeliverableDrawerProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showReopenDialog, setShowReopenDialog] = useState(false);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed right-0 top-0 h-full w-[400px] bg-background border-l shadow-lg z-50"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold truncate">{deliverable.name}</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
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
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getStatusColor(deliverable.status)}>
                        {deliverable.status}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Due {format(new Date(deliverable.dueDate), "MMM d, yyyy")}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Notes</h3>
                      <p className="text-sm text-muted-foreground">
                        {deliverable.notes || "No notes provided."}
                      </p>
                    </div>

                    {deliverable.fileUrl && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Attachments</h3>
                        <a
                          href={deliverable.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          View attached file
                        </a>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Actions</h3>
                      <div className="flex flex-col gap-2">
                        {deliverable.status === "Delivered" && (
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => setShowFeedbackDialog(true)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Request Feedback
                          </Button>
                        )}
                        
                        {deliverable.status === "Approved" && isAdmin && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-full justify-start"
                                  onClick={() => setShowReopenDialog(true)}
                                >
                                  <Unlock className="h-4 w-4 mr-2" />
                                  Reopen for Edit
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Only administrators can reopen approved deliverables</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="feedback" className="h-full">
                  <DeliverableFeedback
                    deliverable={deliverable}
                    isApproved={deliverable.status === "Approved"}
                    onApprove={onApprove}
                    onAddComment={onAddComment}
                    onAddAttachment={onAddAttachment}
                  />
                </TabsContent>

                <TabsContent value="revisions" className="p-4 space-y-4">
                  {deliverable.revisions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No revisions yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {deliverable.revisions.map((revision, index) => (
                        <motion.div
                          key={revision.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                v{deliverable.revisions.length - index}
                              </Badge>
                              <span className="text-sm font-medium">
                                {format(new Date(revision.date), "MMM d, yyyy h:mm a")}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{revision.notes}</p>
                          {revision.fileUrl && (
                            <a
                              href={revision.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <FileText className="h-4 w-4" />
                              View revision file
                            </a>
                          )}
                          {index < deliverable.revisions.length - 1 && <Separator className="my-4" />}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

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