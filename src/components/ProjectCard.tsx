import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Project } from "@/types";
import { calculateProgress } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

const statusIcons = {
  "Not Started": "⚪",
  "In Progress": "🟡",
  "On Hold": "🟠",
  "Completed": "🟢",
  "Cancelled": "🔴"
};

const statusColors = {
  "Not Started": "bg-muted text-muted-foreground",
  "In Progress": "bg-brand-status-info/10 text-brand-status-info",
  "On Hold": "bg-brand-status-warning/10 text-brand-status-warning",
  "Completed": "bg-brand-status-success/10 text-brand-status-success",
  "Cancelled": "bg-brand-status-error/10 text-brand-status-error"
};

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const progress = calculateProgress(project);
  
  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3,
          delay: index * 0.1,
          ease: [0.4, 0, 0.2, 1]
        }}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
      >
        <Link to={`/projects/${project.id}`}>
          <Card className="group h-full transition-all duration-200 hover:border-primary/20 hover:shadow-lg dark:border-border/50 dark:hover:border-primary/30">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between">
                <CardTitle className="line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {project.name}
                </CardTitle>
                <Badge 
                  variant="outline" 
                  className={`${statusColors[project.status as keyof typeof statusColors]} transition-colors`}
                >
                  {statusIcons[project.status as keyof typeof statusIcons]} {project.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground/80 transition-colors">
                {project.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-medium text-primary">
                        {progress}%
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Project completion</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2 bg-muted dark:bg-muted/50" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Client</span>
                  <p className="font-medium text-foreground">{project.client}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date</span>
                  <p className="font-medium text-foreground">
                    {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t pt-4 dark:border-border/50">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {project.milestones?.length || 0} Milestones
                </span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {project.deliverables?.length || 0} Deliverables
                </span>
              </div>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="text-primary font-medium"
              >
                View Details →
              </motion.div>
            </CardFooter>
          </Card>
        </Link>
      </motion.div>
    </TooltipProvider>
  );
}
