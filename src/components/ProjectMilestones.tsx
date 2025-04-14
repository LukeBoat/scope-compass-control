import { useState, useMemo, useEffect, useId, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "@/hooks/useProject";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Milestone as MilestoneType, Deliverable, DeliverableStatus, MilestoneVisibility, Feedback, Revision, MilestoneComment, Project } from "@/types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { toast } from '@/components/ui/use-toast';
import { cn } from "@/lib/utils";
import { Check, GripVertical, X, Clock, Circle, MessageSquare, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lock as LockIcon, Unlock as UnlockIcon, Plus } from "lucide-react";
import { calculateMilestoneProgress } from "@/utils/milestone";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";

interface MilestoneProps {
  projectId: string;
}

interface EditingMilestone {
  projectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  startDate?: string;
  isComplete?: boolean;
  visibility?: MilestoneVisibility;
}

interface EditingDeliverable extends Omit<Deliverable, "id" | "feedback" | "revisions" | "name"> {
  name: string;
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

interface NewMilestone {
  title: string;
  dueDate: string;
  startDate: string;
  description: string;
  visibility: MilestoneVisibility;
}

interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  startDate?: string;
  isComplete?: boolean;
  visibility?: MilestoneVisibility;
  deliverables: Deliverable[];
  comments?: MilestoneComment[];
  order?: number;
}

// Mock data for testing
const mockDeliverables: Deliverable[] = [
  {
    id: "deliverable-1",
    projectId: "project-1",
    name: "Initial Design",
    title: "Initial Design",
    status: "Approved",
    dueDate: "2024-03-15",
    description: "Complete initial design mockups",
    assignedTo: "John Doe",
    visibility: "Internal",
    notes: "Design should follow brand guidelines",
    milestoneId: "milestone-1",
    isApproved: true,
    feedback: [],
    revisions: []
  },
  {
    id: "deliverable-2",
    projectId: "project-1",
    name: "Frontend Implementation",
    title: "Frontend Implementation",
    status: "Delivered",
    dueDate: "2024-03-20",
    description: "Implement frontend components",
    assignedTo: "Jane Smith",
    visibility: "Client",
    notes: "Use React components",
    milestoneId: "milestone-1",
    isApproved: true,
    feedback: [],
    revisions: []
  },
  {
    id: "deliverable-3",
    projectId: "project-1",
    name: "Backend API",
    title: "Backend API",
    status: "In Progress",
    dueDate: "2024-03-25",
    description: "Develop REST API endpoints",
    assignedTo: "Mike Johnson",
    visibility: "Internal",
    notes: "Follow REST best practices",
    milestoneId: "milestone-2",
    isApproved: false,
    feedback: [],
    revisions: []
  },
  {
    id: "deliverable-4",
    projectId: "project-1",
    name: "Testing",
    title: "Testing",
    status: "Not Started",
    dueDate: "2024-03-30",
    description: "Complete test suite",
    assignedTo: "Sarah Wilson",
    visibility: "Internal",
    notes: "Include unit and integration tests",
    milestoneId: "milestone-2",
    isApproved: false,
    feedback: [],
    revisions: []
  }
];

interface SortableDeliverableCardProps {
  deliverable: Deliverable;
  onEdit: (deliverable: Deliverable) => void;
  onDelete: (id: string) => void;
}

function SortableDeliverableCard({ deliverable, onEdit, onDelete }: SortableDeliverableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deliverable.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="p-4 mb-2">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">{deliverable.title}</h4>
            <p className="text-sm text-gray-500">{deliverable.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(deliverable)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(deliverable.id)}>
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Utility functions
const getStatusIcon = (status: DeliverableStatus) => {
  switch (status) {
    case "Approved":
    case "Delivered":
      return <Check className="h-4 w-4 text-green-500" />;
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
  milestones: MilestoneType[];
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
  onSubmit: (milestone: Omit<MilestoneType, "id" | "deliverables" | "comments">) => void;
  initialData?: MilestoneType;
  onDelete?: () => void;
}

function MilestoneForm({ open, onOpenChange, onSubmit, initialData, onDelete }: MilestoneFormProps) {
  const { project } = useProject(initialData?.projectId || "");
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
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    dueDate?: string;
    startDate?: string;
    description?: string;
  }>({});

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
    // Clear errors when form is reset
    setFormErrors({});
  }, [initialData]);

  // Real-time validation
  useEffect(() => {
    const errors: {
      title?: string;
      dueDate?: string;
      startDate?: string;
      description?: string;
    } = {};

    // Title validation
    if (!title.trim()) {
      errors.title = "Title is required";
    } else if (title.length < 3) {
      errors.title = "Title must be at least 3 characters long";
    } else if (title.length > 100) {
      errors.title = "Title must be less than 100 characters";
    }

    // Description validation
    if (description.length > 1000) {
      errors.description = "Description must be less than 1000 characters";
    }

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate) {
      if (startDate < today) {
        errors.startDate = "Start date cannot be in the past";
      }
    }

    if (dueDate) {
      if (dueDate < today) {
        errors.dueDate = "Due date cannot be in the past";
      }
      if (startDate && dueDate < startDate) {
        errors.dueDate = "Due date must be after start date";
      }
    }

    // Project timeline validation
    if (project) {
      const projectStartDate = new Date(project.startDate);
      const projectEndDate = new Date(project.endDate);

      if (startDate && startDate < projectStartDate) {
        errors.startDate = "Start date must be within project timeline";
      }
      if (dueDate && dueDate > projectEndDate) {
        errors.dueDate = "Due date must be within project timeline";
      }
    }

    setFormErrors(errors);
  }, [title, description, startDate, dueDate, project]);

  const validateForm = (): boolean => {
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    onSubmit({
      projectId: project.id,
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Milestone title"
                required
                aria-invalid={!!formErrors.title}
                aria-describedby={formErrors.title ? "title-error" : undefined}
                className={cn(formErrors.title && "border-red-500 focus-visible:ring-red-500")}
              />
              {formErrors.title && (
                <p id="title-error" className="text-sm text-red-500">
                  {formErrors.title}
                </p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground",
                      formErrors.startDate && "border-red-500"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </PopoverContent>
              </Popover>
              {formErrors.startDate && (
                <p className="text-sm text-red-500">
                  {formErrors.startDate}
                </p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground",
                      formErrors.dueDate && "border-red-500"
                    )}
                  >
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </PopoverContent>
              </Popover>
              {formErrors.dueDate && (
                <p className="text-sm text-red-500">
                  {formErrors.dueDate}
                </p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Milestone description"
                rows={3}
                className={cn(formErrors.description && "border-red-500 focus-visible:ring-red-500")}
                aria-invalid={!!formErrors.description}
                aria-describedby={formErrors.description ? "description-error" : undefined}
              />
              {formErrors.description && (
                <p id="description-error" className="text-sm text-red-500">
                  {formErrors.description}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {description.length}/1000 characters
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={visibility}
                onValueChange={(value: MilestoneVisibility) => setVisibility(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Internal">Internal</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isComplete"
                checked={isComplete}
                onCheckedChange={setIsComplete}
              />
              <Label htmlFor="isComplete">Mark as complete</Label>
            </div>
          </div>
          
          <DialogFooter>
            {initialData && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isSubmitting}
              >
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !validateForm()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface MilestoneItemProps {
  milestone: Milestone;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddDeliverable: () => void;
  updateState: (updates: Partial<Milestone>) => void;
}

function SortableMilestoneItem({
  milestone,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddDeliverable,
  updateState
}: MilestoneItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const handleStatusChange = (status: DeliverableStatus) => {
    updateState({ isComplete: status === "Approved" || status === "Delivered" });
  };

  return (
    <AccordionItem
      ref={setNodeRef}
      style={style}
      value={milestone.id}
      className={cn(
        "relative rounded-lg border p-4 mb-4 transition-all duration-200",
        isDragging && "shadow-lg ring-2 ring-brand-purple",
        isExpanded && "ring-2 ring-brand-purple"
      )}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 cursor-grab p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
          isDragging && "cursor-grabbing"
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex items-center justify-between w-full pl-8">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{milestone.title}</h3>
              {milestone.visibility === "Internal" && (
                <LockIcon className="h-4 w-4 text-muted-foreground" />
              )}
              {milestone.visibility === "Client" && (
                <UnlockIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {milestone.dueDate ? (
                <>
                  {calculateDaysUntilDue(milestone.dueDate) < 0 ? (
                    <Badge variant="destructive" className="text-xs">
                      {Math.abs(calculateDaysUntilDue(milestone.dueDate))} days overdue
                    </Badge>
                  ) : calculateDaysUntilDue(milestone.dueDate) === 0 ? (
                    <Badge variant="secondary" className="text-xs">
                      Due today
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-xs">
                      {calculateDaysUntilDue(milestone.dueDate)} days left
                    </Badge>
                  )}
                </>
              ) : (
                <span>No due date</span>
              )}
            </div>
          </div>
        </div>
      </div>

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
              onClick={onAddDeliverable}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Deliverable
            </Button>
          </div>
          <SortableContext
            items={milestone.deliverables.map((d) => d.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
              {milestone.deliverables.length > 0 ? (
                milestone.deliverables.map((deliverable) => (
                  <motion.div
                    key={deliverable.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SortableDeliverableCard
                      deliverable={deliverable}
                      onEdit={(d) => handleStatusChange(d.status)}
                      onDelete={(id) => onDelete()}
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

// Utility function to calculate overall progress
const calculateOverallProgress = (project: Project | null): number => {
  if (!project?.milestones.length) return 0;
  const totalProgress = project.milestones.reduce((acc, milestone) => {
    const milestoneProgress = calculateMilestoneProgress(milestone.deliverables);
    return acc + milestoneProgress;
  }, 0);
  return Math.round(totalProgress / project.milestones.length);
};

const DELIVERABLE_STATUSES = {
  "Not Started": "Not Started",
  "In Progress": "In Progress",
  "Delivered": "Delivered",
  "Approved": "Approved",
  "Rejected": "Rejected",
  "In Review": "In Review"
} as const;

// Memoized components for better performance
const MemoizedSortableDeliverableCard = React.memo(SortableDeliverableCard);
const MemoizedMilestoneForm = React.memo(MilestoneForm);
const MemoizedAddDeliverableForm = React.memo(AddDeliverableForm);

// Constants for pagination
const MILESTONES_PER_PAGE = 5;
const DELIVERABLES_PER_PAGE = 10;

export function ProjectMilestones({ projectId }: { projectId: string }) {
  const { project, updateProject } = useProject(projectId);
  const { deliverables, addDeliverable, updateDeliverable, deleteDeliverable } = useDeliverables(projectId);
  const [editingMilestone, setEditingMilestone] = useState<EditingMilestone | null>(null);
  const [editingDeliverable, setEditingDeliverable] = useState<EditingDeliverable | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [addingDeliverableToMilestoneId, setAddingDeliverableToMilestoneId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingDeliverable, setDeletingDeliverable] = useState<{ id: string; name: string } | null>(null);
  
  // Pagination state
  const [milestonePage, setMilestonePage] = useState(1);
  const [deliverablePages, setDeliverablePages] = useState<Record<string, number>>({});
  const [hasMoreMilestones, setHasMoreMilestones] = useState(true);
  const [hasMoreDeliverables, setHasMoreDeliverables] = useState<Record<string, boolean>>({});
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [showDeliverableForm, setShowDeliverableForm] = useState(false);

  // Memoized filtered milestones
  const filteredMilestones = useMemo(() => {
    if (!project?.milestones) return [];
    return project.milestones.filter(milestone => 
      milestone.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [project?.milestones, searchQuery]);

  // Paginated milestones
  const paginatedMilestones = useMemo(() => {
    return filteredMilestones.slice(0, milestonePage * MILESTONES_PER_PAGE);
  }, [filteredMilestones, milestonePage]);

  // Check if there are more milestones to load
  useEffect(() => {
    setHasMoreMilestones(paginatedMilestones.length < filteredMilestones.length);
  }, [paginatedMilestones, filteredMilestones]);

  // Memoized deliverables for each milestone
  const deliverablesByMilestone = useMemo(() => {
    const map = new Map<string, Deliverable[]>();
    deliverables.forEach(deliverable => {
      if (deliverable.milestoneId) {
        const existing = map.get(deliverable.milestoneId) || [];
        map.set(deliverable.milestoneId, [...existing, deliverable]);
      }
    });
    return map;
  }, [deliverables]);

  // Get paginated deliverables for a milestone
  const getPaginatedDeliverables = useCallback((milestoneId: string) => {
    const milestoneDeliverables = deliverablesByMilestone.get(milestoneId) || [];
    const page = deliverablePages[milestoneId] || 1;
    return milestoneDeliverables.slice(0, page * DELIVERABLES_PER_PAGE);
  }, [deliverablesByMilestone, deliverablePages]);

  // Check if there are more deliverables to load for a milestone
  const hasMoreDeliverablesForMilestone = useCallback((milestoneId: string) => {
    const milestoneDeliverables = deliverablesByMilestone.get(milestoneId) || [];
    const page = deliverablePages[milestoneId] || 1;
    return milestoneDeliverables.length > page * DELIVERABLES_PER_PAGE;
  }, [deliverablesByMilestone, deliverablePages]);

  // Load more deliverables for a milestone
  const loadMoreDeliverables = useCallback((milestoneId: string) => {
    setDeliverablePages(prev => ({
      ...prev,
      [milestoneId]: (prev[milestoneId] || 1) + 1
    }));
  }, []);

  // Load more milestones
  const loadMoreMilestones = useCallback(() => {
    setMilestonePage(prev => prev + 1);
  }, []);

  // Reset pagination when search query changes
  useEffect(() => {
    setMilestonePage(1);
  }, [searchQuery]);

  // Memoized handlers
  const handleAddDeliverable = useCallback(async (milestoneId: string, name: string) => {
    if (!project) return;
    
    try {
      setIsLoading(true);
      const newDeliverable: Omit<Deliverable, "id"> = {
        projectId,
        name,
        title: name,
        status: "pending" as DeliverableStatus,
        dueDate: new Date().toISOString(),
        description: "",
        assignedTo: "",
        visibility: "public" as MilestoneVisibility,
        notes: "",
        milestoneId,
        isApproved: false,
        feedback: [],
        revisions: []
      };
      
      await addDeliverable(newDeliverable);
      setAddingDeliverableToMilestoneId(null);
    } catch (error) {
      setError(error as Error);
      console.error("Error adding deliverable:", error);
    } finally {
      setIsLoading(false);
    }
  }, [project, projectId, addDeliverable]);

  const handleUpdateDeliverable = useCallback(async (deliverableId: string, updates: Partial<Deliverable>) => {
    try {
      setIsLoading(true);
      await updateDeliverable(deliverableId, updates);
      setEditingDeliverable(null);
    } catch (error) {
      setError(error as Error);
      console.error("Error updating deliverable:", error);
    } finally {
      setIsLoading(false);
    }
  }, [updateDeliverable]);

  const handleDeleteDeliverable = useCallback(async (deliverableId: string) => {
    const deliverable = deliverables.find(d => d.id === deliverableId);
    if (deliverable) {
      setDeletingDeliverable({ id: deliverableId, name: deliverable.title });
    }
  }, [deliverables]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingDeliverable) return;
    
    try {
      setIsLoading(true);
      await deleteDeliverable(deletingDeliverable.id);
      setDeletingDeliverable(null);
    } catch (error) {
      setError(error as Error);
      console.error("Error deleting deliverable:", error);
    } finally {
      setIsLoading(false);
    }
  }, [deletingDeliverable, deleteDeliverable]);

  const handleEditDeliverable = (deliverable: Deliverable) => {
    setEditingDeliverable({
      name: deliverable.name,
      projectId: deliverable.projectId,
      status: deliverable.status,
      dueDate: deliverable.dueDate,
      notes: deliverable.notes,
      milestoneId: deliverable.milestoneId,
      isApproved: deliverable.isApproved,
      title: deliverable.title || deliverable.name,
      description: deliverable.description,
      assignedTo: deliverable.assignedTo,
      visibility: deliverable.visibility
    });
    setShowDeliverableForm(true);
  };

  // Memoized milestone handlers
  const handleUpdateMilestone = useCallback(async (milestoneId: string, updates: Partial<Milestone>) => {
    try {
      const milestone = project.milestones.find(m => m.id === milestoneId);
      if (!milestone) return;

      const updatedMilestone = {
        ...milestone,
        ...updates,
        projectId // Ensure projectId is preserved
      };

      await updateProject({ ...project, milestones: project.milestones.map(m => m.id === milestoneId ? updatedMilestone : m) });
    } catch (error) {
      console.error("Error updating milestone:", error);
    }
  }, [project, updateProject]);

  const handleDeleteMilestone = useCallback(async (milestoneId: string) => {
    if (!project) return;
    
    try {
      setIsLoading(true);
      const updatedMilestones = project.milestones.filter(m => m.id !== milestoneId);
      await updateProject({ ...project, milestones: updatedMilestones });
    } catch (error) {
      setError(error as Error);
      console.error("Failed to delete milestone:", error);
    } finally {
      setIsLoading(false);
    }
  }, [project, updateProject]);

  const handleCreateMilestone = useCallback(async () => {
    try {
      const newMilestone: Omit<MilestoneType, "id" | "comments" | "deliverables"> = {
        projectId,
        title: editingMilestone.title,
        description: editingMilestone.description,
        dueDate: editingMilestone.dueDate,
        startDate: editingMilestone.startDate,
        isComplete: editingMilestone.isComplete ?? false,
        visibility: editingMilestone.visibility,
        order: project.milestones.length
      };

      const milestoneWithDefaults: MilestoneType = {
        ...newMilestone,
        id: "", // This will be replaced by the backend
        deliverables: [],
        comments: []
      };

      await updateProject({
        ...project,
        milestones: [...project.milestones, milestoneWithDefaults]
      });
      setShowMilestoneForm(false);
      setEditingMilestone({} as EditingMilestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
    }
  }, [projectId, editingMilestone, project.milestones.length, updateProject]);

  const handleEditMilestone = useCallback((milestone: MilestoneType) => {
    setEditingMilestone({
      projectId: milestone.projectId,
      title: milestone.title,
      description: milestone.description,
      dueDate: milestone.dueDate,
      startDate: milestone.startDate,
      isComplete: milestone.isComplete,
      visibility: milestone.visibility
    });
    setShowMilestoneForm(true);
  }, []);

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = project.milestones.findIndex(m => m.id === active.id);
      const newIndex = project.milestones.findIndex(m => m.id === over.id);
      
      const reorderedMilestones = arrayMove(project.milestones, oldIndex, newIndex).map(
        (milestone, index) => ({ ...milestone, order: index })
      );
      
      updateProject({ ...project, milestones: reorderedMilestones });
    }
  }, [project, updateProject]);

  return (
    <div className="space-y-4" role="region" aria-label="Project Milestones">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Milestones</h2>
        <div className="flex items-center space-x-2">
          <Input
            type="search"
            placeholder="Search milestones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search milestones"
            className="w-64"
          />
          <Dialog open={showMilestoneForm} onOpenChange={setShowMilestoneForm}>
            <DialogTrigger asChild>
              <Button aria-label="Add new milestone">Add Milestone</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Milestone</DialogTitle>
              </DialogHeader>
              {/* Milestone form content */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DndContext
        sensors={useSensors(
          useSensor(PointerSensor, {
            activationConstraint: {
              distance: 8,
            },
          }),
          useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
          })
        )}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={paginatedMilestones.map(m => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <Accordion
            type="multiple"
            value={Array.from(expandedMilestones)}
            onValueChange={(value) => setExpandedMilestones(new Set(value))}
            className="space-y-4"
          >
            {paginatedMilestones.map((milestone) => (
              <SortableMilestoneItem
                key={milestone.id}
                milestone={milestone}
                isExpanded={expandedMilestones.has(milestone.id)}
                onToggle={() => {
                  const newExpanded = new Set(expandedMilestones);
                  if (newExpanded.has(milestone.id)) {
                    newExpanded.delete(milestone.id);
                  } else {
                    newExpanded.add(milestone.id);
                  }
                  setExpandedMilestones(newExpanded);
                }}
                onEdit={() => handleEditMilestone(milestone)}
                onDelete={() => handleDeleteMilestone(milestone.id)}
                onAddDeliverable={() => setAddingDeliverableToMilestoneId(milestone.id)}
                updateState={(updates) => handleUpdateMilestone(milestone.id, updates)}
              />
            ))}
          </Accordion>
        </SortableContext>
      </DndContext>

      {hasMoreMilestones && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={loadMoreMilestones}
            className="flex items-center gap-2"
          >
            Load More Milestones
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Add Deliverable Dialog */}
      {addingDeliverableToMilestoneId && (
        <Dialog open onOpenChange={() => setAddingDeliverableToMilestoneId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Deliverable</DialogTitle>
            </DialogHeader>
            {/* Deliverable form content */}
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Deliverable Dialog */}
      {editingDeliverable && (
        <Dialog open onOpenChange={() => setEditingDeliverable(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Deliverable</DialogTitle>
            </DialogHeader>
            {/* Deliverable edit form content */}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={!!deletingDeliverable}
        onClose={() => setDeletingDeliverable(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Deliverable"
        description={`Are you sure you want to delete "${deletingDeliverable?.name}"? This action cannot be undone.`}
        itemName={deletingDeliverable?.name || ""}
      />
    </div>
  );
} 