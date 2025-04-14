import { useState, useRef, useEffect } from "react";
import { format, addDays, addWeeks, startOfWeek, endOfWeek, isSameDay, isAfter, isBefore, differenceInDays, subDays, addMonths, endOfMonth, addQuarters, endOfQuarter, addYears, endOfYear } from "date-fns";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Calendar, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { Milestone, Deliverable, Revision } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks/useProject";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ProjectTimelineProps {
  projectId: string;
}

type TimelineItem = {
  id: string;
  type: "milestone" | "deliverable" | "revision";
  title: string;
  startDate?: string;
  dueDate?: string;
  status?: string;
  color: string;
  rowIndex: number;
};

type ZoomLevel = "day" | "week" | "month" | "quarter" | "year";

interface MiniMapProps {
  items: TimelineItem[];
  visibleRange: { start: Date; end: Date };
  totalRange: { start: Date; end: Date };
  onRangeChange: (start: Date, end: Date) => void;
}

function MiniMap({ items, visibleRange, totalRange, onRangeChange }: MiniMapProps) {
  const miniMapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const totalDays = differenceInDays(totalRange.end, totalRange.start);
  const visibleStart = differenceInDays(visibleRange.start, totalRange.start);
  const visibleEnd = differenceInDays(visibleRange.end, totalRange.start);
  
  const handleMiniMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!miniMapRef.current) return;
    
    const rect = miniMapRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const daysToAdd = Math.floor(clickPosition * totalDays);
    const newStart = addDays(totalRange.start, daysToAdd);
    const newEnd = addDays(newStart, differenceInDays(visibleRange.end, visibleRange.start));
    
    onRangeChange(newStart, newEnd);
  };

  return (
    <div className="relative h-24 border rounded-md overflow-hidden bg-muted/50">
      <div 
        ref={miniMapRef}
        className="absolute inset-0 cursor-pointer"
        onClick={handleMiniMapClick}
      >
        {/* Mini timeline items */}
        {items.map((item) => {
          const start = item.startDate ? new Date(item.startDate) : totalRange.start;
          const end = item.dueDate ? new Date(item.dueDate) : totalRange.end;
          
          const left = (differenceInDays(start, totalRange.start) / totalDays) * 100;
          const width = (differenceInDays(end, start) / totalDays) * 100;
          
          return (
            <div
              key={item.id}
              className="absolute h-2 rounded-full"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                top: `${item.rowIndex * 4}px`,
                backgroundColor: item.color,
              }}
            />
          );
        })}
        
        {/* Visible range indicator */}
        <div
          className="absolute h-full bg-primary/20 border-2 border-primary"
          style={{
            left: `${(visibleStart / totalDays) * 100}%`,
            width: `${((visibleEnd - visibleStart) / totalDays) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

interface DraggableTimelineItemProps {
  item: TimelineItem;
  style: React.CSSProperties;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  getTooltipContent: (item: TimelineItem) => React.ReactNode;
}

function DraggableTimelineItem({ item, style, onDragStart, onDragEnd, getTooltipContent }: DraggableTimelineItemProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onDragStart({
      active: {
        id: item.id,
        data: { current: item },
        rect: {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
        }
      },
      delta: { x: 0, y: 0 },
      activatorEvent: e as unknown as Event,
    });
  };

  const handleDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onDragEnd({
      active: {
        id: item.id,
        data: { current: item },
        rect: {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
        }
      },
      delta: { x: 0, y: 0 },
      activatorEvent: e as unknown as Event,
    });
  };

  return (
    <motion.div
      style={style}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-move"
      onPointerDown={handleDragStart}
      onPointerUp={handleDragEnd}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="h-full w-full rounded-md bg-background shadow-sm" />
          </TooltipTrigger>
          <TooltipContent>
            {getTooltipContent(item)}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}

export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  const { project, loading, error } = useProject(projectId);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || "Failed to load timeline"}
        </AlertDescription>
      </Alert>
    );
  }

  if (!project) {
    return null;
  }

  // Extract all revisions from deliverables
  const allRevisions = project.deliverables?.flatMap(deliverable => 
    deliverable.revisions.map(revision => ({
      ...revision,
      deliverableId: deliverable.id
    }))
  ) || [];

  // Combine all items and sort by date
  const timelineItems = [
    ...project.milestones.map(m => ({ type: 'milestone' as const, date: m.dueDate || m.startDate || '', item: m })),
    ...project.deliverables.map(d => ({ type: 'deliverable' as const, date: d.dueDate || '', item: d })),
    ...allRevisions.map(r => ({ type: 'revision' as const, date: r.date, item: r }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8">
      {timelineItems.map((timelineItem, index) => (
        <div key={`${timelineItem.type}-${timelineItem.item.id}`} className="relative pl-8 pb-8">
          {/* Timeline connector */}
          {index < timelineItems.length - 1 && (
            <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-200" />
          )}
          
          {/* Timeline dot */}
          <div className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 ${
            timelineItem.type === 'milestone' ? 'bg-blue-500 border-blue-200' :
            timelineItem.type === 'deliverable' ? 'bg-green-500 border-green-200' :
            'bg-purple-500 border-purple-200'
          }`} />

          {/* Content */}
          <div className="bg-white rounded-lg border p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-sm font-medium text-gray-500 capitalize">
                  {timelineItem.type}
                </span>
                <h4 className="text-lg font-semibold">
                  {timelineItem.type === 'milestone' 
                    ? (timelineItem.item as Milestone).title
                    : timelineItem.type === 'deliverable'
                    ? (timelineItem.item as Deliverable).name
                    : `Revision for ${project.deliverables.find(d => d.id === (timelineItem.item as Revision).deliverableId)?.name}`
                  }
                </h4>
              </div>
              <time className="text-sm text-gray-500">
                {new Date(timelineItem.date).toLocaleDateString()}
              </time>
            </div>
            <p className="text-gray-600">
              {timelineItem.type === 'milestone' 
                ? (timelineItem.item as Milestone).description
                : timelineItem.type === 'deliverable'
                ? (timelineItem.item as Deliverable).notes
                : (timelineItem.item as Revision).notes
              }
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 