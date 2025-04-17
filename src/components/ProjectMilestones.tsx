import { useState, useMemo, useEffect, useId, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "@/hooks/useProject";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useMilestones } from "@/hooks/useMilestones";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import { Milestone as MilestoneType, Deliverable, DeliverableStatus, MilestoneVisibility, Feedback, Revision, MilestoneComment, Project, TeamMember } from "@/types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { toast } from '@/components/ui/use-toast';
import { cn } from "@/lib/utils";
import { Check, GripVertical, X, Clock, Circle, MessageSquare, Loader2, ChevronDown, Plus, CalendarIcon, CheckCircle, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Unlock as UnlockIcon } from "lucide-react";
import { calculateMilestoneProgress } from "@/utils/milestone";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { milestoneSchema, deliverableSchema } from "@/lib/validations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { z } from "zod";
import { useClientMode } from "@/hooks/useClientMode";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Navigate, Outlet } from "react-router-dom";
import { UserProvider, useUser } from "@/context/UserContext";
import { Progress } from "@/components/ui/progress";
import { Flag, Users } from "lucide-react";

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

interface ProjectMilestonesProps {
  projectId: string;
  teamMembers: TeamMember[];
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
  onStatusChange: (id: string, status: DeliverableStatus) => void;
}

function SortableDeliverableCard({ deliverable, onEdit, onDelete, onStatusChange }: SortableDeliverableCardProps) {
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
          <div className="flex gap-2 items-center">
            <Select 
              value={deliverable.status} 
              onValueChange={(value) => onStatusChange(deliverable.id, value as DeliverableStatus)}
            >
              <SelectTrigger className="h-8 w-[140px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DELIVERABLE_STATUSES).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

interface AddDeliverableFormProps {
  milestoneId: string;
  onSubmit: (deliverable: Omit<Deliverable, "id" | "revisions" | "feedback">) => void;
  onCancel: () => void;
  initialValues?: EditingDeliverable;
}

function AddDeliverableForm({ milestoneId, onSubmit, onCancel, initialValues }: AddDeliverableFormProps) {
  const { project } = useProject(milestoneId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof deliverableSchema>>({
    resolver: zodResolver(deliverableSchema),
    defaultValues: {
      name: initialValues?.name || "",
      status: initialValues?.status || "Not Started" as const,
      dueDate: initialValues?.dueDate || new Date().toISOString(),
      notes: initialValues?.notes || "",
      milestoneId,
      isApproved: initialValues?.isApproved || false,
      description: initialValues?.description || "",
      assignedTo: initialValues?.assignedTo || "",
      visibility: initialValues?.visibility || "Public" as const,
      projectId: project?.id || "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof deliverableSchema>) => {
    try {
      setIsSubmitting(true);
      const deliverable: Omit<Deliverable, "id" | "revisions" | "feedback"> = {
        name: data.name,
        title: data.name,
        status: data.status,
        dueDate: data.dueDate,
        notes: data.notes || "",
        milestoneId: data.milestoneId,
        isApproved: data.isApproved,
        description: data.description || "",
        assignedTo: data.assignedTo || "",
        visibility: data.visibility,
        projectId: data.projectId,
      };
      await onSubmit(deliverable);
    } catch (error) {
      console.error("Error submitting deliverable:", error);
      toast({
        title: "Error",
        description: "Failed to save deliverable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Deliverable name"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Deliverable description"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString())}
                      initialFocus
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="Private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isApproved"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Mark as approved</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
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
              "Save"
            )}
          </Button>
        </div>
      </form>
    </Form>
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
  project: Project;
  initialData?: Milestone;
  onSubmit: (data: Milestone) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const MilestoneForm = ({
  project,
  initialData,
  onSubmit,
  onCancel,
  onDelete,
}: {
  project: Project;
  initialData?: Milestone;
  onSubmit: (data: Milestone) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const form = useForm<z.infer<typeof milestoneSchema>>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      dueDate: initialData?.dueDate || new Date().toISOString(),
      startDate: initialData?.startDate || new Date().toISOString(),
      isComplete: initialData?.isComplete || false,
      visibility: initialData?.visibility || "Internal",
      projectId: project.id,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description || "",
        dueDate: initialData.dueDate || new Date().toISOString(),
        startDate: initialData.startDate || new Date().toISOString(),
        isComplete: initialData.isComplete,
        visibility: initialData.visibility,
        projectId: project.id,
      });
    }
  }, [initialData, form, project.id]);

  const handleSubmit = async (data: z.infer<typeof milestoneSchema>) => {
    try {
      const milestoneData: Milestone = {
        id: initialData?.id || crypto.randomUUID(),
        projectId: project.id,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        startDate: data.startDate,
        isComplete: data.isComplete,
        visibility: data.visibility,
        deliverables: initialData?.deliverables || [],
        comments: initialData?.comments || [],
        order: initialData?.order || 0,
      };

      await onSubmit(milestoneData);
    } catch (error) {
      console.error("Error submitting milestone:", error);
      toast({
        title: "Error",
        description: "Failed to save milestone. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderDatePicker = (field: any, label: string, required = false) => {
    if (isMobile) {
      return (
        <FormItem className="flex flex-col">
          <FormLabel className="flex items-center gap-1">
            {label}
            {required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              type="date"
              value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
              onChange={(e) => {
                const date = new Date(e.target.value);
                field.onChange(date.toISOString());
              }}
              className="w-full"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      );
    }

    return (
      <FormItem className="flex flex-col">
        <FormLabel className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !field.value && "text-muted-foreground"
                )}
              >
                {field.value ? (
                  format(new Date(field.value), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value ? new Date(field.value) : undefined}
              onSelect={(date) => field.onChange(date?.toISOString() || "")}
              disabled={(date) =>
                date < new Date("1900-01-01")
              }
              initialFocus
              className="rounded-md border shadow-md"
            />
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                Title
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter milestone title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter milestone description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => renderDatePicker(field, "Start Date")}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => renderDatePicker(field, "Due Date", true)}
          />
        </div>

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Internal">Internal</SelectItem>
                  <SelectItem value="Client">Client</SelectItem>
                  <SelectItem value="Public">Public</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isComplete"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Mark as Complete</FormLabel>
                <FormDescription>
                  Mark this milestone as completed
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
};

interface MilestoneItemProps {
  milestone: Milestone;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddDeliverable: () => void;
  updateState: (updates: Partial<Milestone>) => void;
  project: Project | null;
  deliverables: Deliverable[];
  updateDeliverable: (id: string, updates: Partial<Deliverable>) => void;
  updateProject: (updates: Partial<Project>) => void;
}

function SortableMilestoneItem({
  milestone,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddDeliverable,
  updateState,
  project,
  deliverables,
  updateDeliverable,
  updateProject
}: MilestoneItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style = useMemo(() => ({
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }), [transform, transition, isDragging]);

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

      <AccordionContent>
        <div className="space-y-4 pt-4">
          {milestone.description && (
            <div className="text-sm text-muted-foreground mb-4">
              {milestone.description}
            </div>
          )}
          {!isClientMode && (
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
          )}
          <SortableContext
            items={milestone.deliverables.map((d) => d.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence mode="wait">
              {milestone.deliverables.length > 0 ? (
                milestone.deliverables.map((deliverable, index) => (
                  <motion.div
                    key={deliverable.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 0.2,
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                    style={{
                      willChange: "transform, opacity",
                      transform: "translateZ(0)"
                    }}
                  >
                    <SortableDeliverableCard
                      deliverable={deliverable}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={(id, status) => updateDeliverable(id, { status })}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-4 text-muted-foreground"
                >
                  {isClientMode 
                    ? "Waiting on input from team"
                    : "No deliverables match the current filters"
                  }
                </motion.div>
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

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ...other config
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export function ProjectMilestones({ projectId, teamMembers }: ProjectMilestonesProps) {
  const { 
    canEditMilestones, 
    canViewMilestones,
    canEditDeliverables,
    canViewDeliverables
  } = usePermissions({ projectId, teamMembers });
  
  const { project, updateProject } = useProject(projectId);
  const { deliverables, createDeliverable, updateDeliverable, deleteDeliverable } = useDeliverables(projectId);
  const { loading: milestonesLoading, error: milestonesError, createMilestone } = useMilestones(projectId);
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
      milestone.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
  const handleAddDeliverable = useCallback(async (milestoneId: string) => {
    setAddingDeliverableToMilestoneId(milestoneId);
    setShowDeliverableForm(true);
  }, []);

  const handleSubmitDeliverable = async (deliverable: Omit<Deliverable, "id" | "feedback" | "revisions">) => {
    try {
      setIsLoading(true);
      await createDeliverable(deliverable);
      setShowDeliverableForm(false);
      setAddingDeliverableToMilestoneId(null);
      setEditingDeliverable(null);
    } catch (error) {
      console.error("Error creating deliverable:", error);
      toast({
        title: "Error",
        description: "Failed to create deliverable",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDeliverable = useCallback(async (deliverableId: string, updates: Partial<Deliverable>) => {
    if (!deliverableId || !updates) {
      console.error("Missing required arguments for updating deliverable");
      return;
    }
    try {
      setIsLoading(true);
      await updateDeliverable(deliverableId, updates);
      setEditingDeliverable(null);
    } catch (error) {
      console.error("Error updating deliverable:", error);
      toast({
        title: "Error",
        description: "Failed to update deliverable",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [updateDeliverable]);

  const handleDeleteDeliverable = useCallback(async (deliverableId: string) => {
    const deliverable = deliverables.find(d => d.id === deliverableId);
    if (deliverable) {
      setDeletingDeliverable({ id: deliverableId, name: deliverable.title || deliverable.name });
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
    if (!editingMilestone?.title) {
      console.error("Cannot create milestone without a title");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const newMilestone: Omit<Milestone, "id" | "deliverables" | "comments"> = {
        projectId,
        title: editingMilestone.title,
        description: editingMilestone.description,
        dueDate: editingMilestone.dueDate,
        startDate: editingMilestone.startDate,
        isComplete: editingMilestone.isComplete ?? false,
        visibility: editingMilestone.visibility ?? "Public",
        order: project.milestones.length
      };

      // Create the milestone through the hook
      const createdMilestone = await createMilestone(newMilestone);
      
      if (createdMilestone) {
        setShowMilestoneForm(false);
        setEditingMilestone(null);
      }
    } catch (error) {
      setError(error as Error);
      console.error("Error creating milestone:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, editingMilestone, project.milestones.length, createMilestone]);

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (project?.milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-brand-blue/10 p-4 mb-4">
          <Flag className="h-8 w-8 text-brand-blue" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Milestones Yet</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Break down your project into manageable milestones to track progress and keep your team aligned.
        </p>
        <Button className="bg-brand-blue hover:bg-brand-blue-dark">
          <Plus className="h-4 w-4 mr-2" />
          Create First Milestone
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Milestones</h2>
        {canEditMilestones && (
          <Button onClick={() => setShowMilestoneForm(true)}>
            Add Milestone
          </Button>
        )}
      </div>
      
      {project?.milestones?.map((milestone) => (
        <Card key={milestone.id} className="border rounded-lg p-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{milestone.title}</CardTitle>
              <Badge variant="outline">{milestone.visibility}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Due {formatDate(milestone.dueDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{milestone.deliverables.length} assigned</span>
                </div>
              </div>
              <Progress value={calculateMilestoneProgress(milestone.deliverables)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={!!deletingDeliverable}
        onClose={() => setDeletingDeliverable(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Deliverable"
        description="Are you sure you want to delete this deliverable? This action cannot be undone."
        itemName={deletingDeliverable?.name || ""}
      />

      {showDeliverableForm && (
        <Dialog open={showDeliverableForm} onOpenChange={setShowDeliverableForm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingDeliverable ? "Edit Deliverable" : "Add Deliverable"}</DialogTitle>
            </DialogHeader>
            <AddDeliverableForm
              milestoneId={addingDeliverableToMilestoneId || ""}
              onSubmit={handleSubmitDeliverable}
              onCancel={() => {
                setShowDeliverableForm(false);
                setAddingDeliverableToMilestoneId(null);
                setEditingDeliverable(null);
              }}
              initialValues={editingDeliverable}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function ProtectedRoute({
  allowedRoles,
  userRole,
  loading,
}: {
  allowedRoles: string[];
  userRole: string | null;
  loading: boolean;
}) {
  if (loading) return <div>Loading...</div>;
  if (!userRole) return <Navigate to="/login" />;
  if (!allowedRoles.includes(userRole)) return <Navigate to="/login" />;
  return <Outlet />;
} 