import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectActionsProps {
  onAddTask?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProjectActions({
  onAddTask,
  onEdit,
  onDelete,
}: ProjectActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button onClick={onAddTask}>
        <Plus className="mr-2 h-4 w-4" />
        Add Task
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>Edit Project</DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 