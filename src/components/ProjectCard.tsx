
import { Project } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, FileText } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  // Calculate how many deliverables are completed
  const totalDeliverables = project.deliverables.length;
  const completedDeliverables = project.deliverables.filter(
    d => d.status === "Approved"
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
      onClick={() => onClick(project)}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{project.name}</h3>
          <p className="text-sm text-muted-foreground">{project.clientName}</p>
        </div>
        <Badge className={`${getStatusColor(project.status)}`}>
          {project.status}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{completedDeliverables} of {totalDeliverables} deliverables</span>
          </div>
        </div>
        <Progress
          value={project.progress}
          className="h-2 bg-gray-100"
          indicatorClassName="bg-brand-purple-light"
        />
      </CardContent>
      <CardFooter className="p-4 pt-2 border-t flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Due {formatDate(project.endDate)}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium">{project.revisionsUsed}</span>
          <span className="text-muted-foreground">/{project.revisionLimit} revisions</span>
        </div>
      </CardFooter>
    </Card>
  );
}
