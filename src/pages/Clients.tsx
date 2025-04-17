import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Client } from '@/types/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Plus, UserPlus } from 'lucide-react';
import { ClientProjectManager } from '@/components/ClientProjectManager';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/hooks/useAuth';
import { hasProjectAccess } from '@/lib/projectAccess';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  
  // Set page title
  usePageTitle('Clients');
  
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        
        // Check if user is admin
        if (!user) {
          setError(new Error('You must be logged in to view clients'));
          setLoading(false);
          return;
        }
        
        const userDoc = await db.collection('users').doc(user.uid).get();
        const isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
        
        if (!isAdmin) {
          setError(new Error('You do not have permission to view clients'));
          setLoading(false);
          return;
        }
        
        const clientsQuery = query(
          collection(db, 'clients'),
          orderBy('name')
        );
        
        const querySnapshot = await getDocs(clientsQuery);
        const clientsData: Client[] = [];
        
        querySnapshot.forEach((doc) => {
          clientsData.push({ id: doc.id, ...doc.data() } as Client);
        });
        
        setClients(clientsData);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch clients'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
  }, [user]);
  
  const handleCreateClient = async () => {
    if (!newClientName.trim() || !newClientEmail.trim()) return;
    
    try {
      setIsCreating(true);
      
      // Create client document
      const clientRef = await db.collection('clients').add({
        name: newClientName,
        email: newClientEmail,
        assignedProjects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Add to local state
      const newClient: Client = {
        id: clientRef.id,
        name: newClientName,
        email: newClientEmail,
        assignedProjects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setClients(prev => [...prev, newClient]);
      setNewClientName('');
      setNewClientEmail('');
    } catch (err) {
      console.error('Error creating client:', err);
      setError(err instanceof Error ? err : new Error('Failed to create client'));
    } finally {
      setIsCreating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Button onClick={() => setSelectedClientId(null)}>
          <Plus className="h-4 w-4 mr-2" />
          New Client
        </Button>
      </div>
      
      <Tabs defaultValue={selectedClientId ? "projects" : "clients"} className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          {selectedClientId && (
            <TabsTrigger value="projects">Projects</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Client</CardTitle>
              <CardDescription>
                Create a new client account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="Enter client email"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleCreateClient} 
                  disabled={!newClientName.trim() || !newClientEmail.trim() || isCreating}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Client
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {clients.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  No clients found. Create your first client to get started.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <Card key={client.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <CardDescription>{client.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Projects:</span>
                        <span className="text-sm font-medium">{client.assignedProjects.length}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedClientId(client.id)}
                    >
                      View Projects
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {selectedClientId && (
          <TabsContent value="projects">
            <ClientProjectManager clientId={selectedClientId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 