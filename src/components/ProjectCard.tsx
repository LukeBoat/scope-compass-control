import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Project } from "@/types";
import { calculateProgress } from "@/lib/utils";
import { CalendarIcon, UserIcon, ClockIcon, Trash2, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteWithUndo } from "@/lib/delete-with-undo";
import { useProjects } from "@/hooks/useProjects";
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, className }) => {
  const { projects, setProjects } = useProjects();
  const navigate = useNavigate();
  const progress = calculateProgress(project);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleDelete = async () => {
    const previousProjects = [...projects];

    // Optimistically remove the project
    setProjects(projects.filter(p => p.id !== project.id));

    await deleteWithUndo({
      item: project,
      itemName: project.name,
      onDelete: async () => {
        // Here you would make the actual API call to delete the project
        console.log("Project deleted:", project.id);
      },
      onUndo: async () => {
        // Restore the project in the UI
        setProjects(previousProjects);
      },
    });
  };

  const handleViewDetails = () => {
    if (project.id) {
      setIsNavigating(true);
      navigate(`/projects/${project.id}`);
    }
  };

  if (isNavigating) {
    return (
      <Card className={cn("group relative overflow-hidden transition-all duration-300 h-full flex flex-col", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[50px]" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-between"
              disabled
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg dark:bg-gray-800 dark:border-gray-700 cursor-pointer h-full flex flex-col",
        className
      )}
      onClick={handleViewDetails}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold transition-colors duration-200 group-hover:text-brand-blue dark:text-gray-100">
          {project.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground dark:text-gray-400">Progress</span>
              <span className="font-medium dark:text-gray-200">{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 transition-all duration-500 ease-out dark:bg-gray-700"
            />
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full justify-between group-hover:bg-brand-blue/10 dark:hover:bg-brand-blue/20 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
          >
            View Details
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
