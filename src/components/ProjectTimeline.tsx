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

interface ProjectTimelineProps {
  projectId: string;
  milestones: Milestone[];
  deliverables: Deliverable[];
  revisions: Revision[];
  onItemClick: (item: { type: "milestone" | "deliverable" | "revision"; id: string }) => void;
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

export function ProjectTimeline({ 
  projectId, 
  milestones, 
  deliverables, 
  revisions,
  onItemClick 
}: ProjectTimelineProps) {
  const [viewMode, setViewMode] = useState<ZoomLevel>("week");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [today] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState(() => getTimelineRange());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<TimelineItem | null>(null);
  
  // Calculate timeline items
  const timelineItems: TimelineItem[] = [
    // Add milestones
    ...milestones.map((milestone, index) => ({
      id: milestone.id,
      type: "milestone" as const,
      title: milestone.title,
      startDate: milestone.startDate,
      dueDate: milestone.dueDate,
      status: milestone.isComplete ? "Completed" : "In Progress",
      color: milestone.isComplete ? "bg-green-500" : "bg-blue-500",
      rowIndex: index * 2 // Leave space for deliverables between milestones
    })),
    // Add deliverables
    ...deliverables.map((deliverable, index) => ({
      id: deliverable.id,
      type: "deliverable" as const,
      title: deliverable.name,
      dueDate: deliverable.dueDate,
      status: deliverable.status,
      color: getStatusColor(deliverable.status),
      rowIndex: index * 2 + 1 // Place between milestones
    })),
    // Add revisions
    ...revisions.map((revision, index) => ({
      id: revision.id,
      type: "revision" as const,
      title: `Revision ${index + 1}`,
      dueDate: revision.date,
      status: "Completed",
      color: "bg-purple-500",
      rowIndex: milestones.length * 2 + deliverables.length + index // Place after milestones and deliverables
    }))
  ];
  
  // Calculate timeline range based on zoom level
  const getTimelineRange = () => {
    const allDates = timelineItems
      .filter(item => item.startDate || item.dueDate)
      .map(item => {
        const dates = [];
        if (item.startDate) dates.push(new Date(item.startDate));
        if (item.dueDate) dates.push(new Date(item.dueDate));
        return dates;
      })
      .flat();
    
    const minDate = allDates.length > 0 
      ? new Date(Math.min(...allDates.map(d => d.getTime()))) 
      : new Date();
    
    const maxDate = allDates.length > 0 
      ? new Date(Math.max(...allDates.map(d => d.getTime()))) 
      : addWeeks(new Date(), 4);

    // Add padding based on zoom level
    const padding = {
      day: 7,
      week: 4,
      month: 3,
      quarter: 2,
      year: 1
    }[viewMode];

    return {
      start: subDays(minDate, padding),
      end: addDays(maxDate, padding)
    };
  };

  // Generate timeline segments based on zoom level
  const getTimelineSegments = () => {
    const { start, end } = getTimelineRange();
    const segments = [];
    let currentDate = start;

    while (currentDate <= end) {
      switch (viewMode) {
        case "day":
          segments.push({
            start: currentDate,
            end: addDays(currentDate, 1),
            label: format(currentDate, "MMM d")
          });
          currentDate = addDays(currentDate, 1);
          break;
        case "week":
          segments.push({
            start: currentDate,
            end: endOfWeek(currentDate),
            label: `${format(currentDate, "MMM d")} - ${format(endOfWeek(currentDate), "MMM d")}`
          });
          currentDate = addWeeks(currentDate, 1);
          break;
        case "month":
          segments.push({
            start: currentDate,
            end: endOfMonth(currentDate),
            label: format(currentDate, "MMMM yyyy")
          });
          currentDate = addMonths(currentDate, 1);
          break;
        case "quarter":
          segments.push({
            start: currentDate,
            end: endOfQuarter(currentDate),
            label: `Q${getQuarter(currentDate)} ${format(currentDate, "yyyy")}`
          });
          currentDate = addQuarters(currentDate, 1);
          break;
        case "year":
          segments.push({
            start: currentDate,
            end: endOfYear(currentDate),
            label: format(currentDate, "yyyy")
          });
          currentDate = addYears(currentDate, 1);
          break;
      }
    }

    return segments;
  };

  // Helper function to get quarter
  const getQuarter = (date: Date) => {
    return Math.floor(date.getMonth() / 3) + 1;
  };

  // Helper function to get color based on status
  function getStatusColor(status: string): string {
    switch (status) {
      case "Approved":
        return "bg-green-500";
      case "Delivered":
        return "bg-blue-500";
      case "In Progress":
        return "bg-yellow-500";
      case "Not Started":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  }
  
  // Calculate position and width for timeline items
  function getItemStyle(item: TimelineItem) {
    if (!timelineRef.current) return {};
    
    const timelineWidth = timelineRef.current.clientWidth;
    const weekWidth = timelineWidth / weeks.length;
    
    // For revisions (dots)
    if (item.type === "revision" && item.dueDate) {
      const revisionDate = new Date(item.dueDate);
      const weekIndex = weeks.findIndex(week => 
        revisionDate >= week.start && revisionDate <= week.end
      );
      
      if (weekIndex === -1) return { display: 'none' };
      
      const dayOfWeek = revisionDate.getDay();
      const dayWidth = weekWidth / 7;
      const leftPosition = weekIndex * weekWidth + dayOfWeek * dayWidth;
      
      return {
        left: `${leftPosition}px`,
        top: `${item.rowIndex * 40 + 20}px`,
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        position: 'absolute' as const,
        backgroundColor: item.color,
        zIndex: 10
      };
    }
    
    // For milestones and deliverables (bars)
    if (item.type === "milestone") {
      const startDate = item.startDate ? new Date(item.startDate) : new Date();
      const dueDate = item.dueDate ? new Date(item.dueDate) : addWeeks(new Date(), 2);
      
      const startWeekIndex = weeks.findIndex(week => 
        startDate >= week.start && startDate <= week.end
      );
      
      const endWeekIndex = weeks.findIndex(week => 
        dueDate >= week.start && dueDate <= week.end
      );
      
      if (startWeekIndex === -1 || endWeekIndex === -1) return { display: 'none' };
      
      const startDayOfWeek = startDate.getDay();
      const endDayOfWeek = dueDate.getDay();
      
      const startPosition = startWeekIndex * weekWidth + startDayOfWeek * (weekWidth / 7);
      const endPosition = endWeekIndex * weekWidth + endDayOfWeek * (weekWidth / 7);
      const width = endPosition - startPosition;
      
      return {
        left: `${startPosition}px`,
        top: `${item.rowIndex * 40 + 16}px`,
        width: `${width}px`,
        height: '8px',
        position: 'absolute' as const,
        backgroundColor: item.color,
        zIndex: 5
      };
    }
    
    // For deliverables (dots or short bars)
    if (item.type === "deliverable" && item.dueDate) {
      const dueDate = new Date(item.dueDate);
      const weekIndex = weeks.findIndex(week => 
        dueDate >= week.start && dueDate <= week.end
      );
      
      if (weekIndex === -1) return { display: 'none' };
      
      const dayOfWeek = dueDate.getDay();
      const dayWidth = weekWidth / 7;
      const leftPosition = weekIndex * weekWidth + dayOfWeek * dayWidth;
      
      // Check if overdue
      const isOverdue = isBefore(dueDate, today) && item.status !== "Approved" && item.status !== "Delivered";
      
      return {
        left: `${leftPosition}px`,
        top: `${item.rowIndex * 40 + 16}px`,
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        position: 'absolute' as const,
        backgroundColor: isOverdue ? 'bg-red-500' : item.color,
        zIndex: 8
      };
    }
    
    return { display: 'none' };
  }
  
  // Handle scroll
  const handleScroll = (direction: "left" | "right") => {
    if (!timelineRef.current) return;
    
    const scrollAmount = direction === "left" ? -200 : 200;
    timelineRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };
  
  // Handle zoom
  const handleZoom = (level: ZoomLevel) => {
    setViewMode(level);
    // Reset scroll position when zooming
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = 0;
    }
  };
  
  // Scroll to today on mount
  useEffect(() => {
    if (!timelineRef.current) return;
    
    const todayWeekIndex = weeks.findIndex(week => 
      today >= week.start && today <= week.end
    );
    
    if (todayWeekIndex !== -1) {
      const weekWidth = timelineRef.current.clientWidth / weeks.length;
      const scrollToPosition = todayWeekIndex * weekWidth - timelineRef.current.clientWidth / 2;
      
      timelineRef.current.scrollTo({
        left: Math.max(0, scrollToPosition),
        behavior: "smooth"
      });
    }
  }, [weeks, today]);
  
  // Enhanced tooltip content
  const getTooltipContent = (item: TimelineItem) => {
    const startDate = item.startDate ? format(new Date(item.startDate), "MMM d, yyyy") : "Not set";
    const dueDate = item.dueDate ? format(new Date(item.dueDate), "MMM d, yyyy") : "Not set";
    const daysUntilDue = item.dueDate ? differenceInDays(new Date(item.dueDate), new Date()) : null;
    
    return (
      <div className="space-y-2 p-2">
        <div className="font-medium">{item.title}</div>
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Start: {startDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Due: {dueDate}</span>
          </div>
          {daysUntilDue !== null && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {daysUntilDue > 0 
                  ? `Due in ${daysUntilDue} days`
                  : `Overdue by ${Math.abs(daysUntilDue)} days`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {item.status}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const item = timelineItems.find(item => item.id === active.id);
    if (item) {
      setDraggedItem(item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!timelineRef.current || !draggedItem) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    const clickX = event.activatorEvent.clientX - rect.left + scrollLeft;
    
    // Calculate new dates based on drag position
    const totalWidth = timelineRef.current.scrollWidth;
    const dayWidth = totalWidth / totalDays;
    const daysToAdd = Math.round(clickX / dayWidth);
    
    const newStartDate = addDays(new Date(draggedItem.startDate || draggedItem.dueDate!), daysToAdd);
    const newEndDate = addDays(newStartDate, differenceInDays(
      new Date(draggedItem.dueDate || draggedItem.startDate!),
      new Date(draggedItem.startDate || draggedItem.dueDate!)
    ));

    // Update the item's dates
    const updatedItems = timelineItems.map(item => {
      if (item.id === active.id) {
        return {
          ...item,
          startDate: format(newStartDate, "yyyy-MM-dd"),
          dueDate: format(newEndDate, "yyyy-MM-dd"),
        };
      }
      return item;
    });

    // Update state or call API to persist changes
    console.log("Updated items:", updatedItems);
    
    setActiveId(null);
    setDraggedItem(null);
  };

  // Calculate total days for the timeline
  const totalDays = differenceInDays(getTimelineRange().end, getTimelineRange().start);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Project Timeline</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleScroll("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleScroll("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button 
                variant={viewMode === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleZoom("day")}
                className="h-8 px-2"
              >
                Day
              </Button>
              <Button 
                variant={viewMode === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleZoom("week")}
                className="h-8 px-2"
              >
                Week
              </Button>
              <Button 
                variant={viewMode === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleZoom("month")}
                className="h-8 px-2"
              >
                Month
              </Button>
              <Button 
                variant={viewMode === "quarter" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleZoom("quarter")}
                className="h-8 px-2"
              >
                Quarter
              </Button>
              <Button 
                variant={viewMode === "year" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleZoom("year")}
                className="h-8 px-2"
              >
                Year
              </Button>
            </div>
          </div>
        </div>
        
        {timelineItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No timeline data available</p>
              <p className="text-sm text-muted-foreground text-center max-w-md mt-2">
                Timeline will appear once milestones and deliverables are added to the project
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="relative border rounded-md overflow-hidden">
              <div 
                ref={timelineRef}
                className="flex-1 overflow-x-auto"
                style={{ scrollbarWidth: 'thin' }}
              >
                <div className="flex min-w-full">
                  {getTimelineSegments().map((segment, index) => (
                    <div 
                      key={index} 
                      className="flex-1 min-w-[100px] p-2 text-center text-sm"
                    >
                      <div className="font-medium">
                        {segment.label}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Timeline items */}
                <div className="relative">
                  {timelineItems.map((item) => (
                    <DraggableTimelineItem
                      key={item.id}
                      item={item}
                      style={getItemStyle(item)}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      getTooltipContent={getTooltipContent}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Mini-map */}
            <MiniMap
              items={timelineItems}
              visibleRange={visibleRange}
              totalRange={getTimelineRange()}
              onRangeChange={(start, end) => {
                setVisibleRange({ start, end });
                if (timelineRef.current) {
                  const totalWidth = timelineRef.current.scrollWidth;
                  const visibleWidth = timelineRef.current.clientWidth;
                  const scrollPosition = (differenceInDays(start, getTimelineRange().start) / totalDays) * (totalWidth - visibleWidth);
                  timelineRef.current.scrollTo({ left: scrollPosition, behavior: "smooth" });
                }
              }}
            />
          </div>
        )}
      </div>
      
      <DragOverlay>
        {draggedItem && (
          <div
            style={{
              ...getItemStyle(draggedItem),
              opacity: 0.8,
              cursor: "grabbing",
            }}
          >
            <div className="h-full w-full rounded-md bg-background shadow-lg" />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
} 