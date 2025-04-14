import { useState, useEffect } from "react";
import { Project, ProjectStatus } from "@/types";
import { mockProjects } from "@/data/mockData";
import { Header } from "@/components/Header";
import { ProjectFilters } from "@/components/ProjectFilters";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectDrawer } from "@/components/ProjectDrawer";
import { ProjectSkeleton } from "@/components/ProjectSkeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, FolderPlus, Filter } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [sortBy, setSortBy] = useState<"date" | "progress">("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    clientName: "",
    description: "",
  });

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

  const handleAddProject = () => {
    setShowCreateDialog(true);
  };

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.clientName) {
      toast.error("Please fill in all required fields");
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
    toast.success("Project created successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1 container mx-auto py-6 px-4 max-w-6xl">
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
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 mt-6 bg-white rounded-lg shadow-sm">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FolderPlus className="h-10 w-10 text-brand-purple-light" />
                </div>
                {searchQuery || statusFilter !== "All" ? (
                  <>
                    <h3 className="text-xl font-medium mb-2">No projects found</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">We couldn't find any projects matching your current filters. Try adjusting your search or filters.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        variant="outline"
                        className="flex gap-2"
                        onClick={() => {
                          setStatusFilter("All");
                          setSearchQuery("");
                        }}
                      >
                        <Filter className="h-4 w-4" />
                        Clear Filters
                      </Button>
                      <Button 
                        className="bg-brand-purple-light hover:bg-brand-purple flex gap-2"
                        onClick={handleAddProject}
                      >
                        <PlusCircle className="h-4 w-4" />
                        Create New Project
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-medium mb-2">Start your first project</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">Projects help you organize your deliverables and track revisions. Get started by creating your first project.</p>
                    <Button 
                      className="bg-brand-purple-light hover:bg-brand-purple flex gap-2"
                      onClick={handleAddProject}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Create Your First Project
                    </Button>
                  </>
                )}
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

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to start tracking deliverables and revisions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                placeholder="Enter client name"
                value={newProject.clientName}
                onChange={(e) => setNewProject(prev => ({ ...prev, clientName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
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
