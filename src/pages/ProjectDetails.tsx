import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientMode } from '@/hooks/useClientMode';
import { Project } from '@/types';
import { ProjectDeliverables } from '@/components/ProjectDeliverables';
import { ProjectMilestonesSimple } from '@/components/ProjectMilestonesSimple';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toastError } from '@/components/ToastNotification';
import { Skeleton } from '@/components/ui/skeleton';

export function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isClientMode } = useClientMode();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch project details
    const fetchProject = async () => {
      try {
        // TODO: Implement project fetching
        setLoading(false);
      } catch (error) {
        toastError("Error", "Failed to load project details");
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Check if user has permission to perform admin actions
  const canPerformAdminActions = user?.role === 'admin' || user?.role === 'project_owner';

  // Check if user has permission to edit project
  const canEditProject = canPerformAdminActions && !isClientMode;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <p className="text-muted-foreground">The project you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        {canEditProject && (
          <Button variant="outline" onClick={() => {/* TODO: Implement edit */}}>
            Edit Project
          </Button>
        )}
      </div>

      <Tabs defaultValue="deliverables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          {canEditProject && (
            <TabsTrigger value="settings">Settings</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="deliverables">
          <ProjectDeliverables project={project} />
        </TabsContent>

        <TabsContent value="milestones">
          <ProjectMilestonesSimple project={project} />
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Recent activity in this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Activity items would go here */}
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {canEditProject && (
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>Manage project settings and configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Settings form would go here */}
                  <div className="text-center py-8 text-muted-foreground">
                    Settings form coming soon
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 