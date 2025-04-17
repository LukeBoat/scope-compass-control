import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toastSuccess } from "@/components/ToastNotification";
import { formatDate } from "@/lib/utils";
import { CheckCircle, RefreshCw } from "lucide-react";

interface Feedback {
  id: string;
  author: string;
  role: "client" | "admin";
  content: string;
  timestamp: string;
}

interface DeliverableFeedbackPanelProps {
  feedback: Feedback[];
  onSubmit: (message: string) => void;
  onApprove?: () => void;
  onRequestChange?: () => void;
  canApprove?: boolean;
}

export function DeliverableFeedbackPanel({ 
  feedback, 
  onSubmit, 
  onApprove, 
  onRequestChange,
  canApprove = false 
}: DeliverableFeedbackPanelProps) {
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();

  const handleSubmit = () => {
    if (!newMessage.trim()) return;
    onSubmit(newMessage);
    setNewMessage("");
    toastSuccess("Feedback submitted");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Deliverable Feedback</h3>

        <ScrollArea className="h-[300px] rounded-md border p-4">
          {feedback.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No feedback yet.</p>
          ) : (
            <div className="space-y-4">
              {feedback.map((fb) => (
                <div
                  key={fb.id}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{fb.author}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(fb.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{fb.content}</p>
                  <Badge variant={fb.role === "client" ? "secondary" : "outline"}>
                    {fb.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="space-y-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Leave a comment..."
            className="min-h-[100px] resize-none"
          />
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-brand-purple hover:bg-brand-purple-dark"
          >
            Submit Feedback
          </Button>
        </div>
      </div>

      {canApprove && (
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={onApprove}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve Deliverable
          </Button>
          <Button
            onClick={onRequestChange}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Request Change
          </Button>
        </div>
      )}
    </div>
  );
} 