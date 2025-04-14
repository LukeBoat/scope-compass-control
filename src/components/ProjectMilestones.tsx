import { useState, useMemo, useEffect, useId, useRef } from "react";
import { Deliverable, DeliverableStatus, Milestone, MilestoneVisibility } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Circle, Clock, Check, X, GripVertical, Plus, ChevronDown, ChevronUp, Search, Loader2, Pencil, Trash2, MessageSquare, Eye, Unlock, Lock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { useMilestones } from "@/hooks/use-firestore";
import { toastError, toastSuccess } from "@/components/ToastNotification";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDeliverables } from "@/hooks/useDeliverables";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface MilestoneProps {
  projectId: string;
}

interface EditingDeliverable {
  id: string;
  name: string;
  status: DeliverableStatus;
}

interface NewDeliverable {
  name: string;
  status: DeliverableStatus;
  dueDate: string;
  milestoneId: string | null;
}

interface MilestoneCommentType {
  id: string;
  milestoneId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

// Mock data for testing
const mockMilestones: Milestone[] = [
  {
    id: "1",
    title: "Phase 1: Planning",
    dueDate: "2024-03-01",
    description: "Initial planning and requirements gathering",
    deliverables: [
      {
        id: "1",
        title: "Project Charter",
        status: "Approved",
        dueDate: "2024-02-15",
        description: "Project charter document",
        assignedTo: "John Doe",
        visibility: "Internal"
      },
      {
        id: "2",
        title: "Requirements Document",
        status: "Delivered",
        dueDate: "2024-02-28",
        description: "Detailed requirements specification",
        assignedTo: "Jane Smith",
        visibility: "Client"
      }
    ],
    visibility: "Internal"
  },
  {
    id: "2",
    title: "Phase 2: Development",
    dueDate: "2024-04-01",
    description: "Core development phase",
    deliverables: [
      {
        id: "3",
        title: "Frontend Development",
        status: "In Progress",
        dueDate: "2024-03-15",
        description: "Frontend implementation",
        assignedTo: "Alice Johnson",
        visibility: "Internal"
      },
      {
        id: "4",
        title: "Backend Development",
        status: "Not Started",
        dueDate: "2024-03-30",
        description: "Backend implementation",
        assignedTo: "Bob Wilson",
        visibility: "Internal"
      }
    ],
    visibility: "Internal"
  }
];

interface SortableDeliverableCardProps {
  deliverable: Deliverable;
  isEditing: boolean;
  editingDeliverable: EditingDeliverable | null;
  onStartEditing: (deliverable: Deliverable) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (status: DeliverableStatus) => void;
}

function SortableDeliverableCard({
  deliverable,
  isEditing,
  editingDeliverable,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onNameChange,
  onStatusChange,
}: SortableDeliverableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deliverable.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className={cn("relative", isDragging && "shadow-lg")}>
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pl-8">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editingDeliverable?.name}
                onChange={onNameChange}
                className="h-8 w-[200px]"
                autoFocus
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={onSaveEdit}
                  className="rounded-full p-1 hover:bg-muted"
                >
                  <Check className="h-4 w-4 text-green-500" />
                </button>
                <button
                  onClick={onCancelEdit}
                  className="rounded-full p-1 hover:bg-muted"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ) : (
            <CardTitle
              className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
              onClick={() => onStartEditing(deliverable)}
            >
              {deliverable.name}
            </CardTitle>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Select
              value={editingDeliverable?.status}
              onValueChange={onStatusChange}
            >
              <SelectTrigger className="h-8 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <>
              {getStatusIcon(deliverable.status)}
              <Badge
                variant="outline"
                className="flex items-center gap-1 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => onStartEditing(deliverable)}
              >
                <Calendar className="h-3 w-3" />
                {formatDate(deliverable.dueDate)}
              </Badge>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Status: {deliverable.status}
        </div>
      </CardContent>
    </Card>
  );
}

// Utility functions
const getStatusIcon = (status: DeliverableStatus) => {
  switch (status) {
    case "Approved":
    case "Delivered":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "In Progress":
      return <Clock className="h-4 w-4 text-blue-500" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const calculateDaysUntilDue = (dueDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

const getDueBadgeVariant = (daysUntilDue: number) => {
  if (daysUntilDue < 0) return "destructive";
  if (daysUntilDue <= 7) return "secondary";
  return "outline";
};

function AddDeliverableForm({
  onSave,
  onCancel,
  milestones,
  currentMilestoneId,
}: {
  onSave: (deliverable: NewDeliverable) => void;
  onCancel: () => void;
  milestones: Milestone[];
  currentMilestoneId?: string;
}) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<DeliverableStatus>("Not Started");
  const [dueDate, setDueDate] = useState("");
  const [milestoneId, setMilestoneId] = useState<string | null>(currentMilestoneId || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      status,
      dueDate: dueDate || undefined,
      milestoneId,
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border rounded-lg bg-card"
    >
      <div className="space-y-2">
        <Input
          placeholder="Deliverable name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="h-8"
        />
        <Select value={status} onValueChange={(value: DeliverableStatus) => setStatus(value)}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="h-8"
        />
        <Select 
          value={milestoneId || ""} 
          onValueChange={(value) => setMilestoneId(value || null)}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Assign to milestone (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Unassigned</SelectItem>
            {milestones.map((milestone) => (
              <SelectItem key={milestone.id} value={milestone.id}>
                {milestone.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button type="submit" size="sm" className="h-8">
          <Check className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </motion.form>
  );
}

// Check if all deliverables in a milestone are approved
const isMilestoneComplete = (deliverables: Deliverable[]) => {
  if (deliverables.length === 0) return false;
  return deliverables.every(deliverable => deliverable.status === "Approved");
};

interface MilestoneCommentsProps {
  milestoneId: string;
  comments: MilestoneCommentType[];
  onAddComment: (milestoneId: string, content: string) => void;
}

function MilestoneComments({ milestoneId, comments, onAddComment }: MilestoneCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    onAddComment(milestoneId, newComment.trim());
    setNewComment("");
    setIsSubmitting(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">Comments</h4>
      </div>
      
      <ScrollArea className="h-[200px] rounded-md border p-4">
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{comment.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No comments yet</p>
          </div>
        )}
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="sm" 
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Post Comment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface MilestoneFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (milestone: Omit<Milestone, "id" | "deliverables" | "comments">) => void;
  initialData?: Milestone;
  onDelete?: () => void;
}

function MilestoneForm({ open, onOpenChange, onSubmit, initialData, onDelete }: MilestoneFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.dueDate ? new Date(initialData.dueDate) : undefined
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : undefined
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [isComplete, setIsComplete] = useState(initialData?.isComplete || false);
  const [visibility, setVisibility] = useState<MilestoneVisibility>(
    initialData?.visibility || "Public"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDueDate(initialData.dueDate ? new Date(initialData.dueDate) : undefined);
      setStartDate(initialData.startDate ? new Date(initialData.startDate) : undefined);
      setDescription(initialData.description || "");
      setIsComplete(initialData.isComplete || false);
      setVisibility(initialData.visibility || "Public");
    } else {
      setTitle("");
      setDueDate(undefined);
      setStartDate(undefined);
      setDescription("");
      setIsComplete(false);
      setVisibility("Public");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    
    onSubmit({
      title: title.trim(),
      dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
      startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
      description: description.trim() || undefined,
      isComplete,
      visibility,
    });
    
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Milestone" : "Create Milestone"}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Update the milestone details below." 
              : "Fill in the details to create a new milestone."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Milestone title"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Milestone description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select 
                value={visibility} 
                onValueChange={(value: MilestoneVisibility) => setVisibility(value)}
              >
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>Public</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Client">
                    <div className="flex items-center gap-2">
                      <Unlock className="h-4 w-4" />
                      <span>Client</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Internal">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Internal</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isComplete"
                checked={isComplete}
                onCheckedChange={setIsComplete}
              />
              <Label htmlFor="isComplete">Mark as Complete</Label>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            {initialData && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isSubmitting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {initialData ? "Save Changes" : "Create Milestone"}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface SortableMilestoneItemProps {
  milestone: Milestone;
  daysUntilDue: number | null;
  isComplete: boolean;
  progress: number;
  isHighlighted: boolean;
  expandedItems: string[];
  onAccordionChange: (value: string[]) => void;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
  onAddDeliverable: (milestoneId: string) => void;
  milestoneRef: (el: HTMLDivElement | null) => void;
}

function SortableMilestoneItem({
  milestone,
  daysUntilDue,
  isComplete,
  progress,
  isHighlighted,
  expandedItems,
  onAccordionChange,
  onEdit,
  onDelete,
  onAddDeliverable,
  milestoneRef,
}: SortableMilestoneItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <AccordionItem 
      value={milestone.id}
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        isDragging && "shadow-lg z-10"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <AccordionTrigger className="pl-8 hover:no-underline">
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{milestone.title}</span>
            {isComplete && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Complete
              </Badge>
            )}
            {milestone.dueDate && (
              <>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(milestone.dueDate)}
                </Badge>
                <Badge 
                  variant={getDueBadgeVariant(daysUntilDue)} 
                  className="flex items-center gap-1"
                >
                  {daysUntilDue < 0 
                    ? `Overdue by ${Math.abs(daysUntilDue)} days` 
                    : `Due in ${daysUntilDue} days`}
                </Badge>
              </>
            )}
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(milestone);
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(milestone.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Progress
              value={progress}
              className={cn(
                "h-2 w-32",
                isComplete && "bg-green-100 [&>div]:bg-green-500"
              )}
            />
            <span>
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-4">
          {milestone.description && (
            <div className="text-sm text-muted-foreground mb-4">
              {milestone.description}
            </div>
          )}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddDeliverable(milestone.id)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Deliverable
            </Button>
          </div>
          {addingDeliverableToMilestoneId === milestone.id && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AddDeliverableForm
                onSave={(newDeliverable) => {
                  handleAddDeliverable(milestone.id, newDeliverable);
                  setAddingDeliverableToMilestoneId(null);
                }}
                onCancel={() => setAddingDeliverableToMilestoneId(null)}
                milestones={milestones}
                currentMilestoneId={milestone.id}
              />
            </motion.div>
          )}
          <SortableContext
            items={getFilteredDeliverables(milestone.deliverables).map((d) => d.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
              {getFilteredDeliverables(milestone.deliverables).length > 0 ? (
                getFilteredDeliverables(milestone.deliverables).map((deliverable) => (
                  <motion.div
                    key={deliverable.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SortableDeliverableCard
                      deliverable={deliverable}
                      isEditing={editingDeliverable?.id === deliverable.id}
                      editingDeliverable={editingDeliverable}
                      onStartEditing={handleStartEditing}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={handleCancelEdit}
                      onNameChange={handleNameChange}
                      onStatusChange={handleStatusChange}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No deliverables match the current filters
                </div>
              )}
            </AnimatePresence>
          </SortableContext>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function ProjectMilestones({ projectId }: MilestoneProps) {
  const { milestones, loading, error } = useMilestones(projectId);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDeliverable, setEditingDeliverable] = useState<EditingDeliverable | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedMilestone, setDraggedMilestone] = useState<Milestone | null>(null);
  const [isCreateMilestoneOpen, setIsCreateMilestoneOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [addingDeliverableToMilestoneId, setAddingDeliverableToMilestoneId] = useState<string | null>(null);
  const [newMilestoneId, setNewMilestoneId] = useState<string | null>(null);
  const [highlightedMilestoneId, setHighlightedMilestoneId] = useState<string | null>(null);
  const milestoneRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // New state for milestone form
  const [milestoneFormOpen, setMilestoneFormOpen] = useState(false);
  const [deleteMilestoneId, setDeleteMilestoneId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"client" | "internal">("internal"); // For testing
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
  const { deliverables, addDeliverable, updateDeliverable } = useDeliverables(projectId);

  // Update local state when fetched data changes
  useEffect(() => {
    if (milestones.length > 0) {
      setMilestones(milestones);
    }
  }, [milestones]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toastError("Error loading milestones", error.message);
    }
  }, [error]);

  // Sort milestones by due date
  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => {
      // Handle milestones without due dates
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1; // Milestones without due dates go to the end
      if (!b.dueDate) return -1;
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [milestones]);

  // Get all deliverables from all milestones
  const allDeliverables = useMemo(() => {
    return milestones.flatMap(milestone => milestone.deliverables);
  }, [milestones]);

  // Get unassigned deliverables
  const unassignedDeliverables = useMemo(() => {
    return allDeliverables.filter(deliverable => !deliverable.milestoneId);
  }, [allDeliverables]);

  // Filter deliverables based on status and search query
  const getFilteredDeliverables = (deliverables: Deliverable[]) => {
    return deliverables.filter(deliverable => {
      const matchesStatus = statusFilter === "All" || deliverable.status === statusFilter;
      const matchesSearch = searchQuery === "" || 
        deliverable.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  };

  const calculateMilestoneProgress = (deliverables: Deliverable[]) => {
    const completed = deliverables.filter(
      (d) => d.status === "Delivered" || d.status === "Approved"
    ).length;
    return (completed / deliverables.length) * 100;
  };

  const handleStartEditing = (deliverable: Deliverable) => {
    setEditingDeliverable({
      id: deliverable.id,
      name: deliverable.name,
      status: deliverable.status,
    });
  };

  const handleSaveEdit = () => {
    if (!editingDeliverable) return;

    setMilestones((prevMilestones) =>
      prevMilestones.map((milestone) => ({
        ...milestone,
        deliverables: milestone.deliverables.map((deliverable) =>
          deliverable.id === editingDeliverable.id
            ? {
                ...deliverable,
                name: editingDeliverable.name,
                status: editingDeliverable.status,
              }
            : deliverable
        ),
      }))
    );

    setEditingDeliverable(null);
  };

  const handleCancelEdit = () => {
    setEditingDeliverable(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingDeliverable) return;
    setEditingDeliverable({
      ...editingDeliverable,
      name: e.target.value,
    });
  };

  const handleStatusChange = (newStatus: DeliverableStatus) => {
    if (!editingDeliverable) return;
    setEditingDeliverable({
      ...editingDeliverable,
      status: newStatus,
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const milestone = milestones.find(m => m.id === active.id);
    if (milestone) {
      setDraggedMilestone(milestone);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    const sourceDroppableId = result.source.droppableId;
    const destDroppableId = result.destination.droppableId;

    // Handle reordering within the same milestone
    if (sourceDroppableId === destDroppableId) {
      const milestone = milestones.find(m => m.id === sourceDroppableId);
      if (!milestone) return;

      const newDeliverables = Array.from(deliverables.filter(d => d.milestoneId === milestone.id));
      const [removed] = newDeliverables.splice(sourceIndex, 1);
      newDeliverables.splice(destIndex, 0, removed);

      // Update milestone with new deliverable order
      updateMilestone({
        ...milestone,
        deliverableIds: newDeliverables.map(d => d.id)
      });
    } else {
      // Handle moving between milestones
      const deliverable = deliverables.find(d => d.id === result.draggableId);
      if (!deliverable) return;

      updateDeliverable({
        ...deliverable,
        milestoneId: destDroppableId
      });
    }
  };

  const handleAddDeliverable = (milestoneId: string, name: string) => {
    addDeliverable({
      id: crypto.randomUUID(),
      projectId,
      milestoneId,
      name,
      status: "Not Started",
      dueDate: new Date().toISOString(),
      isApproved: false,
      revisions: [],
      feedback: []
    });
    setAddingDeliverableToMilestoneId(null);
  };

  const handleExpandAll = () => {
    setExpandedItems(sortedMilestones.map(milestone => milestone.id));
  };

  const handleCollapseAll = () => {
    setExpandedItems([]);
  };

  const handleAccordionChange = (value: string[]) => {
    setExpandedItems(value);
  };

  // New functions for milestone management
  const handleCreateMilestone = (newMilestone: Omit<Milestone, "id" | "deliverables">) => {
    const id = useId();
    const milestone: Milestone = {
      id,
      title: newMilestone.title,
      dueDate: newMilestone.dueDate,
      description: newMilestone.description,
      isComplete: newMilestone.isComplete,
      deliverables: [],
      order: milestones.length, // Set order to the end of the list
    };
    
    setMilestones((prev) => [...prev, milestone]);
    setExpandedItems((prev) => [...prev, id]);
    setNewMilestoneId(id);
    
    // Auto-scroll to the new milestone after a short delay
    setTimeout(() => {
      const element = milestoneRefs.current[id];
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setHighlightedMilestoneId(id);
        
        // Remove highlight after 1.5 seconds for a quicker flash
        setTimeout(() => {
          setHighlightedMilestoneId(null);
        }, 1500);
      }
    }, 100);
  };

  const handleUpdateMilestone = (updatedMilestone: Omit<Milestone, "id" | "deliverables">) => {
    if (!editingMilestone) return;
    
    setMilestones((prev) =>
      prev.map((milestone) =>
        milestone.id === editingMilestone.id
          ? {
              ...milestone,
              title: updatedMilestone.title,
              dueDate: updatedMilestone.dueDate,
              description: updatedMilestone.description,
              isComplete: updatedMilestone.isComplete,
            }
          : milestone
      )
    );
    
    setEditingMilestone(null);
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((milestone) => milestone.id !== id));
    setExpandedItems((prev) => prev.filter((itemId) => itemId !== id));
    setDeleteMilestoneId(null);
  };

  const openMilestoneForm = (milestone?: Milestone) => {
    if (milestone) {
      setEditingMilestone(milestone);
    } else {
      setEditingMilestone(null);
    }
    setMilestoneFormOpen(true);
  };

  const handleAddComment = (milestoneId: string, content: string) => {
    const newComment: MilestoneCommentType = {
      id: useId(),
      milestoneId,
      userId: "current-user-id", // This should come from your auth context
      userName: "Current User", // This should come from your auth context
      content,
      createdAt: new Date().toISOString(),
    };

    setMilestones((prevMilestones) =>
      prevMilestones.map((milestone) =>
        milestone.id === milestoneId
          ? {
              ...milestone,
              comments: [...(milestone.comments || []), newComment],
            }
          : milestone
      )
    );
  };

  const filteredMilestones = useMemo(() => {
    return milestones
      .filter(milestone => {
        // Filter by search query
        const matchesSearch = milestone.title.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filter by visibility based on user role
        const matchesVisibility = userRole === "client" 
          ? milestone.visibility === "Public" || milestone.visibility === "Client"
          : true;
        
        return matchesSearch && matchesVisibility;
      })
      .sort((a, b) => {
        // First sort by order if available
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        
        // Fall back to due date sorting
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [milestones, searchQuery, userRole]);

  // Calculate overall project progress
  const overallProgress = useMemo(() => {
    if (allDeliverables.length === 0) return 0;
    
    const completedDeliverables = allDeliverables.filter(
      d => d.status === "Delivered" || d.status === "Approved"
    ).length;
    
    return Math.round((completedDeliverables / allDeliverables.length) * 100);
  }, [allDeliverables]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center mb-8">
        <img
          src="/assets/logo.svg"
          alt="Scope Sentinel"
          className="h-16 mb-4"
        />
      </div>
      
      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Overall Progress</h3>
          <span className="text-sm text-muted-foreground">{overallProgress}%</span>
        </div>
        <Progress 
          value={overallProgress} 
          className="h-2"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Project Milestones</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => openMilestoneForm()}
            className="bg-brand-purple hover:bg-brand-purple/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Milestone
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExpandAll}
            className="flex items-center gap-1"
          >
            <ChevronDown className="h-4 w-4" />
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCollapseAll}
            className="flex items-center gap-1"
          >
            <ChevronUp className="h-4 w-4" />
            Collapse All
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deliverables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: DeliverableStatus | "All") => setStatusFilter(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Accordion 
          type="multiple" 
          value={expandedItems}
          onValueChange={handleAccordionChange}
          className="w-full"
        >
          <SortableContext
            items={filteredMilestones.map(m => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
              {filteredMilestones.map((milestone) => {
                const daysUntilDue = milestone.dueDate ? calculateDaysUntilDue(milestone.dueDate) : null;
                const isComplete = milestone.isComplete || isMilestoneComplete(milestone.deliverables);
                const progress = calculateMilestoneProgress(milestone.deliverables);
                const isHighlighted = highlightedMilestoneId === milestone.id;
                
                return (
                  <motion.div
                    key={milestone.id}
                    layout
                    transition={{ duration: 0.3 }}
                  >
                    <SortableMilestoneItem
                      milestone={milestone}
                      daysUntilDue={daysUntilDue}
                      isComplete={isComplete}
                      progress={progress}
                      isHighlighted={isHighlighted}
                      expandedItems={expandedItems}
                      onAccordionChange={handleAccordionChange}
                      onEdit={openMilestoneForm}
                      onDelete={(id) => {
                        setDeleteMilestoneId(id);
                        setMilestoneFormOpen(true);
                      }}
                      onAddDeliverable={(id) => setAddingDeliverableToMilestoneId(id)}
                      milestoneRef={(el) => (milestoneRefs.current[milestone.id] = el)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </SortableContext>
        </Accordion>
        
        {/* Unassigned Deliverables Section */}
        {unassignedDeliverables.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Unassigned Deliverables</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddingDeliverableToMilestoneId("unassigned")}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Deliverable
              </Button>
            </div>
            
            {addingDeliverableToMilestoneId === "unassigned" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AddDeliverableForm
                  onSave={(newDeliverable) => {
                    // Create a new milestone ID for unassigned deliverables
                    const newId = Math.random().toString(36).substr(2, 9);
                    setMilestones((prevMilestones) => [
                      ...prevMilestones,
                      {
                        id: newId,
                        title: "Unassigned",
                        deliverables: [
                          {
                            id: Math.random().toString(36).substr(2, 9),
                            projectId: projectId,
                            name: newDeliverable.name,
                            status: newDeliverable.status,
                            dueDate: newDeliverable.dueDate || new Date().toISOString().split('T')[0],
                            revisions: [],
                            milestoneId: null,
                          },
                        ],
                      },
                    ]);
                    setAddingDeliverableToMilestoneId(null);
                  }}
                  onCancel={() => setAddingDeliverableToMilestoneId(null)}
                  milestones={milestones}
                />
              </motion.div>
            )}
            
            <SortableContext
              items={getFilteredDeliverables(unassignedDeliverables).map((d) => d.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                {getFilteredDeliverables(unassignedDeliverables).length > 0 ? (
                  getFilteredDeliverables(unassignedDeliverables).map((deliverable) => (
                    <motion.div
                      key={deliverable.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SortableDeliverableCard
                        deliverable={deliverable}
                        isEditing={editingDeliverable?.id === deliverable.id}
                        editingDeliverable={editingDeliverable}
                        onStartEditing={handleStartEditing}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        onNameChange={handleNameChange}
                        onStatusChange={handleStatusChange}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No unassigned deliverables match the current filters
                  </div>
                )}
              </AnimatePresence>
            </SortableContext>
          </div>
        )}
        
        <DragOverlay>
          {activeDeliverable ? (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {activeDeliverable.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(activeDeliverable.status)}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(activeDeliverable.dueDate)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Status: {activeDeliverable.status}
                </div>
              </CardContent>
            </Card>
          ) : activeMilestoneId ? (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {milestones.find(m => m.id === activeMilestoneId)?.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {milestones.find(m => m.id === activeMilestoneId)?.dueDate 
                      ? formatDate(milestones.find(m => m.id === activeMilestoneId)?.dueDate || '')
                      : 'No due date'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {milestones.find(m => m.id === activeMilestoneId)?.deliverables.length || 0} deliverables
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Milestone Form Dialog */}
      <MilestoneForm
        open={milestoneFormOpen}
        onOpenChange={setMilestoneFormOpen}
        onSubmit={editingMilestone ? handleUpdateMilestone : handleCreateMilestone}
        initialData={editingMilestone || undefined}
        onDelete={deleteMilestoneId ? () => handleDeleteMilestone(deleteMilestoneId) : undefined}
      />
    </div>
  );
} 