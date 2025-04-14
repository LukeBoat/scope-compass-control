
import { useState } from "react";
import { ProjectStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Calendar, BarChart2, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ProjectFiltersProps {
  onStatusChange: (status: ProjectStatus | "All") => void;
  onSortChange: (sort: "date" | "progress") => void;
}

export function ProjectFilters({ onStatusChange, onSortChange }: ProjectFiltersProps) {
  const [status, setStatus] = useState<ProjectStatus | "All">("All");
  const [sort, setSort] = useState<"date" | "progress">("date");

  const handleStatusChange = (value: ProjectStatus | "All") => {
    setStatus(value);
    onStatusChange(value);
  };

  const handleSortChange = (value: "date" | "progress") => {
    setSort(value);
    onSortChange(value);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      <div>
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">Status</h3>
        <ToggleGroup type="single" value={status} onValueChange={(value) => handleStatusChange(value as ProjectStatus | "All")}>
          <ToggleGroupItem value="All" aria-label="All Projects" className={status === "All" ? "bg-brand-purple-light text-white" : ""}>
            All
          </ToggleGroupItem>
          <ToggleGroupItem value="Active" aria-label="Active Projects" className={status === "Active" ? "bg-green-100 text-green-800" : ""}>
            Active
          </ToggleGroupItem>
          <ToggleGroupItem value="On Hold" aria-label="On Hold Projects" className={status === "On Hold" ? "bg-yellow-100 text-yellow-800" : ""}>
            On Hold
          </ToggleGroupItem>
          <ToggleGroupItem value="Completed" aria-label="Completed Projects" className={status === "Completed" ? "bg-blue-100 text-blue-800" : ""}>
            Completed
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Sort By: {sort === "date" ? "Date" : "Progress"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Sort Projects</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sort} onValueChange={(value) => handleSortChange(value as "date" | "progress")}>
              <DropdownMenuRadioItem value="date" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span>Start Date</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="progress" className="gap-2">
                <BarChart2 className="h-4 w-4" />
                <span>Progress</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
