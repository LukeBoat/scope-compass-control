
import { Project } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Clock, FileText, CalendarDays, RotateCcw } from "lucide-react";

interface ProjectInfoProps {
  project: Project;
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  };

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(project.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-6 pb-6">
      <h3 className="text-lg font-medium">Project Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Start Date</span>
              </div>
              <span className="font-medium">{formatDate(project.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Due Date</span>
              </div>
              <span className="font-medium">{formatDate(project.endDate)}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Days Remaining</span>
              </div>
              <Badge variant="outline" className="font-medium">{calculateDaysRemaining()} days</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deliverables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total Deliverables</span>
              </div>
              <span className="font-medium">{project.deliverables.length}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Revision Limit</span>
              </div>
              <span className="font-medium">{project.revisionLimit}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Revisions Used</span>
              </div>
              <Badge variant="outline" className={project.revisionsUsed >= project.revisionLimit ? "bg-red-100 text-red-800 hover:bg-red-200" : "font-medium"}>
                {project.revisionsUsed}/{project.revisionLimit}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Project Description</h3>
        <Card>
          <CardContent className="p-4">
            <p>{project.description}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
