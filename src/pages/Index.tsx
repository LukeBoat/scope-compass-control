
import { useState, useEffect } from "react";
import { Project, ProjectStatus } from "@/types";
import { mockProjects } from "@/data/mockData";
import { Header } from "@/components/Header";
import { ProjectFilters } from "@/components/ProjectFilters";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectDrawer } from "@/components/ProjectDrawer";
import { ProjectSkeleton } from "@/components/ProjectSkeleton";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [sortBy, setSortBy] = useState<"date" | "progress">("date");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setProjects(mockProjects);
      setFilteredProjects(mockProjects);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let result = [...projects];
    
    // Apply status filter
    if (statusFilter !== "All") {
      result = result.filter(project => project.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        project => 
          project.name.toLowerCase().includes(query) || 
          project.clientName.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result = result.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      } else {
        return b.progress - a.progress;
      }
    });
    
    setFilteredProjects(result);
  }, [projects, statusFilter, sortBy, searchQuery]);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleStatusChange = (status: ProjectStatus | "All") => {
    setStatusFilter(status);
  };

  const handleSortChange = (sort: "date" | "progress") => {
    setSortBy(sort);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1 container mx-auto py-6 px-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your client projects and track scope.</p>
        </div>
        
        <ProjectFilters 
          onStatusChange={handleStatusChange} 
          onSortChange={handleSortChange} 
        />
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {[...Array(6)].map((_, index) => (
              <ProjectSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {filteredProjects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onClick={handleProjectClick} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 mt-6 bg-white rounded-lg shadow-sm">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">No projects found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search query.</p>
                <button 
                  className="px-4 py-2 rounded-md bg-brand-purple-light text-white hover:bg-brand-purple"
                  onClick={() => {
                    setStatusFilter("All");
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </main>
      
      {selectedProject && (
        <ProjectDrawer
          project={selectedProject}
          open={drawerOpen}
          onClose={handleDrawerClose}
        />
      )}
    </div>
  );
};

export default Index;
