import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types";

interface ProjectStatsProps {
  project: Project;
}

export default function ProjectStats({ project }: ProjectStatsProps) {
  const completedDeliverables = project.deliverables.filter((deliverable) => deliverable.status === "Approved").length;
  const totalDeliverables = project.deliverables.length;
  const progress = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Deliverables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDeliverables}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Deliverables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedDeliverables}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progress.toFixed(1)}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">End Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDate(project.endDate)}</div>
        </CardContent>
      </Card>
    </div>
  );
} 