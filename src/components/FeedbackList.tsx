import { ScrollArea } from "@/components/ui/scroll-area";
import { FeedbackBubble } from "@/components/FeedbackBubble";
import { Feedback } from "@/types";

interface FeedbackListProps {
  feedback: Feedback[];
}

export function FeedbackList({ feedback }: FeedbackListProps) {
  if (feedback.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No feedback yet. Be the first to provide feedback!
      </p>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {feedback.map((item, index) => (
          <FeedbackBubble key={index} feedback={item} />
        ))}
      </div>
    </ScrollArea>
  );
} 