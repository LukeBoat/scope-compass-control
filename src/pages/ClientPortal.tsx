import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentClientId, getCurrentClientProjects } from '@/lib/clientAuth';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowRight, Check, Clock, FileText, MessageSquare, X } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define types for our data
interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  teamMembers: {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'editor' | 'viewer';
    avatar?: string;
    status: 'active' | 'pending';
  }[];
}

interface Deliverable {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  fileUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface RevisionLog {
  id: string;
  deliverableId: string;
  comment: string;
  createdAt: string;
  createdBy: string;
}

interface FilteredRevisionLog extends RevisionLog {
  deliverableName: string;
}

export default function ClientPortal() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [revisionLogs, setRevisionLogs] = useState<FilteredRevisionLog[]>([]);
  const [filteredRevisionLogs, setFilteredRevisionLogs] = useState<FilteredRevisionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDeliverableFilter, setSelectedDeliverableFilter] = useState<string>("all");
  
  // Set page title
  usePageTitle('Client Portal');
  
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
          
          // Select the first project by default if available
          if (clientProjects.length > 0) {
            setSelectedProject(clientProjects[0]);
          }
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
  
  // Fetch deliverables and revision logs when a project is selected
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!selectedProject) return;
      
      try {
        setLoading(true);
        
        // Fetch deliverables for the selected project
        const deliverablesQuery = query(
          collection(db, 'deliverables'),
          where('projectId', '==', selectedProject.id)
        );
        
        const deliverablesSnapshot = await getDocs(deliverablesQuery);
        const deliverablesData = deliverablesSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          status: doc.data().status as 'pending' | 'approved' | 'rejected' | 'in_review'
        })) as Deliverable[];
        
        setDeliverables(deliverablesData);
        
        // Fetch revision logs for the selected project
        const revisionLogsQuery = query(
          collection(db, 'revisionLogs'),
          where('projectId', '==', selectedProject.id)
        );
        
        const revisionLogsSnapshot = await getDocs(revisionLogsQuery);
        const revisionLogsData = revisionLogsSnapshot.docs.map(doc => {
          const data = doc.data() as Omit<RevisionLog, 'id'>;
          const deliverable = deliverablesData.find(d => d.id === data.deliverableId);
          return {
            id: doc.id,
            ...data,
            deliverableName: deliverable?.name || 'Unknown Deliverable'
          } as FilteredRevisionLog;
        });
        
        // Sort revision logs by date (newest first)
        revisionLogsData.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setRevisionLogs(revisionLogsData);
        setFilteredRevisionLogs(revisionLogsData);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch project details'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [selectedProject]);
  
  // Add this effect to handle filtering
  useEffect(() => {
    if (selectedDeliverableFilter === "all") {
      setFilteredRevisionLogs(revisionLogs);
    } else {
      setFilteredRevisionLogs(
        revisionLogs.filter(log => log.deliverableId === selectedDeliverableFilter)
      );
    }
  }, [selectedDeliverableFilter, revisionLogs]);
  
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };
  
  const handleApproveDeliverable = async (deliverableId: string) => {
    if (!selectedProject) return;
    
    try {
      setSubmitting(true);
      
      // Update the deliverable status and approvalStatus
      const deliverableRef = doc(db, 'deliverables', deliverableId);
      await updateDoc(deliverableRef, {
        status: 'approved' as const,
        approvalStatus: 'Approved' as const,
        notes: feedback,
        updatedAt: new Date().toISOString()
      });
      
      // Create a revision log entry
      const revisionLogRef = collection(db, 'revisionLogs');
      const newRevisionLog = {
        id: 'temp-id',
        projectId: selectedProject.id,
        deliverableId,
        comment: feedback,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || 'client',
        deliverableName: deliverables.find(d => d.id === deliverableId)?.name || 'Unknown Deliverable'
      };
      
      await addDoc(revisionLogRef, newRevisionLog);
      
      // Refresh deliverables
      const updatedDeliverables = deliverables.map(d => 
        d.id === deliverableId 
          ? { 
              ...d, 
              status: 'approved' as const, 
              approvalStatus: 'Approved' as const,
              notes: feedback, 
              updatedAt: new Date().toISOString() 
            }
          : d
      );
      
      setDeliverables(updatedDeliverables);
      
      // Refresh revision logs
      setRevisionLogs([newRevisionLog, ...revisionLogs]);
      
      // Clear feedback
      setFeedback('');
      
    } catch (err) {
      console.error('Error approving deliverable:', err);
      setError(err instanceof Error ? err : new Error('Failed to approve deliverable'));
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleRejectDeliverable = async (deliverableId: string) => {
    if (!selectedProject) return;
    
    try {
      setSubmitting(true);
      
      // Update the deliverable status and approvalStatus
      const deliverableRef = doc(db, 'deliverables', deliverableId);
      await updateDoc(deliverableRef, {
        status: 'rejected' as const,
        approvalStatus: 'Changes Requested' as const,
        notes: feedback,
        updatedAt: new Date().toISOString()
      });
      
      // Create a revision log entry
      const revisionLogRef = collection(db, 'revisionLogs');
      const newRevisionLog = {
        id: 'temp-id',
        projectId: selectedProject.id,
        deliverableId,
        comment: feedback,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || 'client',
        deliverableName: deliverables.find(d => d.id === deliverableId)?.name || 'Unknown Deliverable'
      };
      
      await addDoc(revisionLogRef, newRevisionLog);
      
      // Refresh deliverables
      const updatedDeliverables = deliverables.map(d => 
        d.id === deliverableId 
          ? { 
              ...d, 
              status: 'rejected' as const, 
              approvalStatus: 'Changes Requested' as const,
              notes: feedback, 
              updatedAt: new Date().toISOString() 
            }
          : d
      );
      
      setDeliverables(updatedDeliverables);
      
      // Refresh revision logs
      setRevisionLogs([newRevisionLog, ...revisionLogs]);
      
      // Clear feedback
      setFeedback('');
      
    } catch (err) {
      console.error('Error rejecting deliverable:', err);
      setError(err instanceof Error ? err : new Error('Failed to reject deliverable'));
    } finally {
      setSubmitting(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'in_review':
        return <Badge variant="secondary"><MessageSquare className="h-3 w-3 mr-1" /> In Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white"><Check className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-brand-neutral-light">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-2 mb-8">
            <img src="/logo.svg" alt="Scope Compass" className="h-8 w-auto" />
            <h1 className="text-2xl font-semibold text-brand-neutral-dark">Client Portal</h1>
          </div>
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please log in to access the client portal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white" 
                onClick={() => navigate('/client-login')}
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
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
            <h1 className="text-2xl font-semibold text-brand-neutral-dark">Client Portal</h1>
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
            <h1 className="text-2xl font-semibold text-brand-neutral-dark">Client Portal</h1>
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
            <h1 className="text-2xl font-semibold text-brand-neutral-dark">Client Portal</h1>
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
  
  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-brand-neutral-light">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-2 mb-8">
            <img src="/logo.svg" alt="Scope Compass" className="h-8 w-auto" />
            <h1 className="text-2xl font-semibold text-brand-neutral-dark">Client Portal</h1>
          </div>
          <Alert>
            <AlertTitle>No Projects</AlertTitle>
            <AlertDescription>
              You don't have any assigned projects yet.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-brand-neutral-light">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.svg" alt="Scope Compass" className="h-8 w-auto" />
            <h1 className="text-2xl font-semibold text-brand-neutral-dark">Client Portal</h1>
          </div>
          <p className="text-muted-foreground">Welcome, {user.email}</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Project Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-brand-card-border">
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>
                  Select a project to view details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {projects.map((project) => (
                    <Button
                      key={project.id}
                      variant={selectedProject?.id === project.id ? "default" : "outline"}
                      className={`w-full justify-start ${
                        selectedProject?.id === project.id 
                          ? "bg-brand-blue hover:bg-brand-blue-dark text-white" 
                          : "hover:bg-brand-muted-gray"
                      }`}
                      onClick={() => handleProjectSelect(project)}
                    >
                      {project.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Project Details */}
          <div className="lg:col-span-3">
            {selectedProject && (
              <>
                <Card className="mb-6 border-brand-card-border">
                  <CardHeader>
                    <CardTitle>{selectedProject.name}</CardTitle>
                    <CardDescription>{selectedProject.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                        <p className="mt-1">{getStatusBadge(selectedProject.status)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                        <p className="mt-1">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                        <p className="mt-1">{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Project Team</CardTitle>
                    <CardDescription>Contact information for the project team members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedProject.teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {member.avatar ? (
                                <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-full" />
                              ) : (
                                <span className="text-sm font-medium">
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge 
                                      variant="outline" 
                                      className="bg-brand-purple/10 text-brand-purple border-brand-purple/20 hover:bg-brand-purple/20 transition-colors"
                                    >
                                      {member.role}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="font-medium capitalize">{member.role}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {member.role === 'owner' 
                                        ? 'Project owner with full access'
                                        : member.role === 'editor'
                                        ? 'Can edit project content'
                                        : 'Can view project content'}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                              {member.status}
                            </Badge>
                            <a 
                              href={`mailto:${member.email}`}
                              className="text-sm text-primary hover:underline flex items-center space-x-1"
                            >
                              <span>{member.email}</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Tabs defaultValue="deliverables" className="space-y-4">
                  <TabsList className="bg-brand-muted-gray">
                    <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                    <TabsTrigger value="revisions">Revision Logs</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="deliverables">
                    <div className="space-y-4">
                      {deliverables.length === 0 ? (
                        <Alert>
                          <AlertTitle>No Deliverables</AlertTitle>
                          <AlertDescription>
                            There are no deliverables for this project yet.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        deliverables.map((deliverable) => (
                          <Card key={deliverable.id} className="border-brand-card-border">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">{deliverable.name}</CardTitle>
                                  <CardDescription>{deliverable.description}</CardDescription>
                                </div>
                                {getStatusBadge(deliverable.status)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              {deliverable.fileUrl && (
                                <div className="mb-4">
                                  <h3 className="text-sm font-medium mb-2">File</h3>
                                  <Button variant="outline" asChild>
                                    <a href={deliverable.fileUrl} target="_blank" rel="noopener noreferrer">
                                      <FileText className="h-4 w-4 mr-2" />
                                      View File
                                    </a>
                                  </Button>
                                </div>
                              )}
                              
                              {deliverable.notes && (
                                <div className="mb-4">
                                  <h3 className="text-sm font-medium mb-2">Notes</h3>
                                  <p className="text-sm">{deliverable.notes}</p>
                                </div>
                              )}
                              
                              {deliverable.status === 'in_review' && (
                                <div className="mt-4">
                                  <h3 className="text-sm font-medium mb-2">Feedback</h3>
                                  <textarea
                                    className="w-full p-2 border rounded-md border-brand-card-border"
                                    rows={3}
                                    placeholder="Enter your feedback here..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                  />
                                  <div className="flex space-x-2 mt-2">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => handleRejectDeliverable(deliverable.id)}
                                      disabled={!feedback || submitting}
                                      className="hover:bg-brand-muted-gray"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button 
                                      className="bg-brand-status-success hover:bg-brand-status-success/90 text-white"
                                      onClick={() => handleApproveDeliverable(deliverable.id)}
                                      disabled={submitting}
                                    >
                                      <Check className="w-4 h-4 mr-2" />
                                      Approve
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="revisions">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Revision History</h3>
                        <Select
                          value={selectedDeliverableFilter}
                          onValueChange={setSelectedDeliverableFilter}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by deliverable" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Deliverables</SelectItem>
                            {deliverables.map((deliverable) => (
                              <SelectItem key={deliverable.id} value={deliverable.id}>
                                {deliverable.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {filteredRevisionLogs.length === 0 ? (
                        <Alert>
                          <AlertTitle>No Revision Logs</AlertTitle>
                          <AlertDescription>
                            {selectedDeliverableFilter === "all" 
                              ? "There are no revision logs for this project yet."
                              : "There are no revision logs for this deliverable yet."}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-4">
                          {filteredRevisionLogs.map((log) => (
                            <Card key={log.id} className="border-brand-card-border">
                              <CardHeader>
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <CardTitle className="text-sm font-medium">
                                      {log.deliverableName}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(log.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                  <Badge variant="outline">
                                    {log.createdBy}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm">{log.comment}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 