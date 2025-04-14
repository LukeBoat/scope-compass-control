
import { useState } from "react";
import { ProjectStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Calendar, BarChart2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <div className="flex items-center gap-2 p-4">
      <div className="flex gap-2">
        <Button
          variant={status === "All" ? "default" : "outline"}
          onClick={() => handleStatusChange("All")}
          className={status === "All" ? "bg-brand-purple-light hover:bg-brand-purple" : ""}
        >
          All
        </Button>
        <Button
          variant={status === "Active" ? "default" : "outline"}
          onClick={() => handleStatusChange("Active")}
          className={status === "Active" ? "bg-brand-purple-light hover:bg-brand-purple" : ""}
        >
          Active
        </Button>
        <Button
          variant={status === "On Hold" ? "default" : "outline"}
          onClick={() => handleStatusChange("On Hold")}
          className={status === "On Hold" ? "bg-brand-purple-light hover:bg-brand-purple" : ""}
        >
          On Hold
        </Button>
        <Button
          variant={status === "Completed" ? "default" : "outline"}
          onClick={() => handleStatusChange("Completed")}
          className={status === "Completed" ? "bg-brand-purple-light hover:bg-brand-purple" : ""}
        >
          Completed
        </Button>
      </div>

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Sort By
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
