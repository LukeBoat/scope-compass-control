import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientAuthManager } from '@/components/ClientAuthManager';
import { getCurrentClientId, getCurrentClientProjects } from '@/lib/clientAuth';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowRight, Building2, Users } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { motion } from 'framer-motion';

export default function ClientLogin() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle('Client Access Portal');
  
  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get the client ID from custom claims
        const currentClientId = await getCurrentClientId();
        setClientId(currentClientId);
        
        if (currentClientId) {
          // Get the client's projects
          const clientProjects = await getCurrentClientProjects();
          setProjects(clientProjects);
        }
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch client data'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [user]);
  
  const handleViewProject = (projectId: string) => {
    navigate(`/client-portal/${projectId}`);
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-neutral-light to-white">
        <div className="container mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <img src="/logo.svg" alt="Scope Compass" className="h-12 w-auto mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-brand-neutral-dark mb-2">Client Access Portal</h1>
              <p className="text-muted-foreground text-lg">
                Access your projects, review deliverables, and collaborate with our team
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <Card className="border-brand-card-border">
                  <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>
                      Sign in to access your client portal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ClientAuthManager />
                  </CardContent>
                </Card>

                <Card className="border-brand-card-border">
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                    <CardDescription>
                      Contact our support team for assistance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-brand-blue" />
                        <div>
                          <p className="font-medium">Support Hours</p>
                          <p className="text-sm text-muted-foreground">Monday - Friday, 9am - 5pm EST</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-brand-blue" />
                        <div>
                          <p className="font-medium">Contact Support</p>
                          <p className="text-sm text-muted-foreground">support@scopecompass.com</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-brand-card-border">
                  <CardHeader>
                    <CardTitle>Client Portal Features</CardTitle>
                    <CardDescription>
                      Everything you need to manage your projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-brand-blue" />
                        </div>
                        <div>
                          <p className="font-medium">Project Dashboard</p>
                          <p className="text-sm text-muted-foreground">View all your active projects in one place</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-brand-blue" />
                        </div>
                        <div>
                          <p className="font-medium">Deliverable Review</p>
                          <p className="text-sm text-muted-foreground">Review and approve project deliverables</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-brand-blue" />
                        </div>
                        <div>
                          <p className="font-medium">Real-time Updates</p>
                          <p className="text-sm text-muted-foreground">Stay informed with project progress and updates</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-neutral-light">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-2 mb-8">
            <img src="/logo.svg" alt="Scope Compass" className="h-8 w-auto" />
            <h1 className="text-2xl font-semibold text-brand-neutral-dark">Client Dashboard</h1>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-brand-neutral-light">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-2 mb-8">
            <img src="/logo.svg" alt="Scope Compass" className="h-8 w-auto" />
            <h1 className="text-2xl font-semibold text-brand-neutral-dark">Client Dashboard</h1>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }
  
  if (!clientId) {
    return (
      <div className="min-h-screen bg-brand-neutral-light">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-2 mb-8">
            <img src="/logo.svg" alt="Scope Compass" className="h-8 w-auto" />
            <h1 className="text-2xl font-semibold text-brand-neutral-dark">Client Dashboard</h1>
          </div>
          <Alert>
            <AlertTitle>Not a Client</AlertTitle>
            <AlertDescription>
              Your account does not have client access. Please contact an administrator.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-brand-neutral-light">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-8">
          <img src="/logo.svg" alt="Scope Compass" className="h-8 w-auto" />
          <h1 className="text-2xl font-semibold text-brand-neutral-dark">Client Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>
                View and manage your assigned projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-muted-foreground">You don't have any assigned projects yet.</p>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => handleViewProject(project.id)}
                          className="w-full"
                        >
                          View Project
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your client account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p>{user.email}</p>
                </div>
                <div>
                  <h3 className="font-medium">Client ID</h3>
                  <p>{clientId}</p>
                </div>
                <div>
                  <h3 className="font-medium">Projects</h3>
                  <p>{projects.length} assigned projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 