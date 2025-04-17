import { useState, useEffect, useMemo } from "react";
import { Project, ProjectStatus } from "@/types";
import { mockProjects } from "@/data/mockData";
import { Header } from "@/components/Header";
import { ProjectFilters } from "@/components/ProjectFilters";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectDrawer } from "@/components/ProjectDrawer";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, FolderPlus, Filter } from "lucide-react";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";

// Number of projects to load initially
const INITIAL_LOAD_COUNT = 6;
// Number of projects to load when scrolling
const LOAD_MORE_COUNT = 6;

const Index = () => {
  // Set page title
  usePageTitle("Dashboard");

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [sortBy, setSortBy] = useState<"date" | "progress">("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    clientName: "",
    description: ""
  });
  const [errors, setErrors] = useState({
    name: "",
    clientName: "",
    description: ""
  });
  const [displayCount, setDisplayCount] = useState(INITIAL_LOAD_COUNT);
  const [hasMore, setHasMore] = useState(true);

  // Load projects with a simulated delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockProjectsList = Object.values(mockProjects);
      setProjects(mockProjectsList);
      setFilteredProjects(mockProjectsList);
      setDisplayedProjects(mockProjectsList.slice(0, INITIAL_LOAD_COUNT));
      setHasMore(mockProjectsList.length > INITIAL_LOAD_COUNT);
      setLoading(false);
    }, 1000); // Reduced from 1500ms to 1000ms

    return () => clearTimeout(timer);
  }, []);

  // Filter and sort projects
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
        // Calculate progress based on approved deliverables
        const getProgress = (project: Project) => {
          const total = project.deliverables.length;
          if (total === 0) return 0;
          const completed = project.deliverables.filter(d => d.status === "Approved").length;
          return (completed / total) * 100;
        };
        return getProgress(b) - getProgress(a);
      }
    });
    
    setFilteredProjects(result);
    setDisplayedProjects(result.slice(0, displayCount));
    setHasMore(result.length > displayCount);
  }, [projects, statusFilter, sortBy, searchQuery, displayCount]);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(null);
    setDrawerOpen(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setSelectedProject(project);
    }, 800);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleStatusChange = (status: ProjectStatus | "All") => {
    setStatusFilter(status);
    setDisplayCount(INITIAL_LOAD_COUNT); // Reset display count when filter changes
  };

  const handleSortChange = (sort: "date" | "progress") => {
    setSortBy(sort);
    setDisplayCount(INITIAL_LOAD_COUNT); // Reset display count when sort changes
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setDisplayCount(INITIAL_LOAD_COUNT); // Reset display count when search changes
  };

  const handleAddProject = () => {
    setShowCreateDialog(true);
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      clientName: "",
      description: ""
    };
    let isValid = true;

    if (!newProject.name.trim()) {
      newErrors.name = "Project name is required";
      isValid = false;
    }

    if (!newProject.clientName.trim()) {
      newErrors.clientName = "Client name is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreateProject = () => {
    if (!validateForm()) {
      return;
    }

    const project: Project = {
      id: `proj_${Date.now()}`,
      name: newProject.name,
      description: newProject.description,
      status: "Active" as ProjectStatus,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      client: newProject.clientName,
      clientName: newProject.clientName,
      budget: 0,
      milestones: [],
      deliverables: [],
      team: [],
      notes: "",
      revisionLimit: 3,
      revisionsUsed: 0
    };

    setProjects(prev => [project, ...prev]);
    setShowCreateDialog(false);
    setNewProject({ name: "", clientName: "", description: "" });
    setErrors({ name: "", clientName: "", description: "" });
    toast.success("Project created successfully");
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + LOAD_MORE_COUNT);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1 container mx-auto py-6 px-4 max-w-6xl">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Projects</h1>
                <p className="text-muted-foreground">Manage your client projects and track scope.</p>
              </div>
              <Button 
                onClick={handleAddProject}
                className="mt-4 md:mt-0 bg-brand-purple-light hover:bg-brand-purple flex gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                New Project
              </Button>
            </div>
            
            <ProjectFilters 
              onStatusChange={handleStatusChange} 
              onSortChange={handleSortChange} 
            />
            
            {filteredProjects.length === 0 ? (
              <div className="mt-8 text-center py-12 bg-white rounded-lg shadow-sm">
                <FolderPlus className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No projects found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery 
                    ? "No projects match your search criteria. Try adjusting your filters."
                    : "Get started by creating your first project."}
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={handleAddProject}
                    className="mt-4"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {displayedProjects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onClick={() => handleProjectClick(project)} 
                  />
                ))}
              </div>
            )}
            
            {hasMore && (
              <div className="mt-8 text-center">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore}
                  className="mx-auto"
                >
                  Load More Projects
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      
      <ProjectDrawer 
        project={selectedProject} 
        open={drawerOpen} 
        onClose={handleDrawerClose} 
      />
      
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to track deliverables and milestones.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                Project Name
                <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="name" 
                value={newProject.name} 
                onChange={e => {
                  setNewProject(prev => ({ ...prev, name: e.target.value }));
                  if (e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, name: "" }));
                  }
                }}
                placeholder="Enter project name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client" className="flex items-center gap-1">
                Client Name
                <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="client" 
                value={newProject.clientName} 
                onChange={e => {
                  setNewProject(prev => ({ ...prev, clientName: e.target.value }));
                  if (e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, clientName: "" }));
                  }
                }}
                placeholder="Enter client name"
                className={errors.clientName ? "border-destructive" : ""}
              />
              {errors.clientName && (
                <p className="text-sm text-destructive">{errors.clientName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={newProject.description} 
                onChange={e => setNewProject(prev => ({ ...prev, description: e.target.value }))} 
                placeholder="Enter project description" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setErrors({ name: "", clientName: "", description: "" });
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
