import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";
import { Deliverable, DeliverableStatus } from "@/types";
import { cn } from "@/lib/utils";

interface SortableDeliverableCardProps {
  deliverable: Deliverable;
  isDragging?: boolean;
  onEdit?: (deliverable: Deliverable) => void;
  onDelete?: (id: string) => void;
}

export function SortableDeliverableCard({ 
  deliverable, 
  isDragging,
  onEdit,
  onDelete
}: SortableDeliverableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: deliverable.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      role="listitem"
      aria-label={`Deliverable: ${deliverable.title}`}
      aria-describedby={`deliverable-${deliverable.id}-description`}
      tabIndex={0}
    >
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300",
        isDragging ? "shadow-lg" : "hover:shadow-md"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardContent className="relative p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button 
                className="cursor-grab transition-transform duration-200 hover:scale-110" 
                {...listeners}
                aria-label="Drag to reorder"
                aria-roledescription="sortable"
              >
                <GripVertical className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </button>
              <div>
                <h4 className="font-medium transition-colors duration-200 group-hover:text-brand-blue">{deliverable.title}</h4>
                <p 
                  id={`deliverable-${deliverable.id}-description`}
                  className="text-sm text-gray-500"
                >
                  {deliverable.description}
                </p>
              </div>
            </div>
            <Badge 
              variant={deliverable.status === "Approved" ? "default" : "secondary"}
              className="transition-transform duration-200 group-hover:scale-105"
              aria-label={`Status: ${deliverable.status}`}
            >
              {deliverable.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 