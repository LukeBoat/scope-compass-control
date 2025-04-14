import { Link } from "react-router-dom";
import { Project, DeliverableStatus } from "@/types";
import { calculateProgress } from "@/lib/utils";
import { CalendarIcon, UserIcon, ClockIcon } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progress = calculateProgress(project);

  return (
    <Link 
      to={`/projects/${project.id}`}
      className="block p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-brand-blue transition-all duration-200 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-blue transition-colors">
            {project.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <UserIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 font-medium">
              {project.clientName}
            </span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          project.status === "Completed" ? "bg-green-100 text-green-800" :
          project.status === "In Progress" ? "bg-blue-100 text-blue-800" :
          project.status === "On Hold" ? "bg-yellow-100 text-yellow-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {project.status}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4" />
          <span>Due: {new Date(project.endDate).toLocaleDateString()}</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-blue transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ClockIcon className="h-4 w-4" />
          <span>
            {project.deliverables.filter(d => d.status === "Approved").length} of {project.deliverables.length} deliverables completed
          </span>
        </div>
      </div>
    </Link>
  );
}
