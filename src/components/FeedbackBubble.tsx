import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Feedback } from "@/types";

interface FeedbackBubbleProps {
  feedback: Feedback;
}

export function FeedbackBubble({ feedback }: FeedbackBubbleProps) {
  return (
    <div 
      className={`rounded-lg p-4 ${
        feedback.role === 'client' 
          ? 'bg-purple-50 border border-purple-100' 
          : 'bg-gray-50 border border-gray-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {feedback.author.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{feedback.author}</span>
            <Badge variant="outline" className="text-xs">
              {feedback.role === 'client' ? 'Client' : 'Team'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(feedback.timestamp)}
            </span>
          </div>
          <p className="mt-2 text-sm">{feedback.content}</p>
        </div>
      </div>
    </div>
  );
} 