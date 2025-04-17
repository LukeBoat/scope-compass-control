import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, DollarSign, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
}

export function ClientInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchInvoices() {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // First, get the client's projects
        const projectsRef = collection(db, 'projects');
        const projectsQuery = query(projectsRef, where('clientId', '==', user.uid));
        const projectsSnapshot = await getDocs(projectsQuery);
        
        const projectIds = projectsSnapshot.docs.map(doc => doc.id);
        
        // Then, get invoices for those projects
        const invoicesRef = collection(db, 'invoices');
        const invoicesQuery = query(invoicesRef, where('projectId', 'in', projectIds));
        const invoicesSnapshot = await getDocs(invoicesQuery);

        const invoicesData = await Promise.all(
          invoicesSnapshot.docs.map(async (invoiceDoc) => {
            const data = invoiceDoc.data();
            // Get project name
            const projectDoc = await getDoc(doc(db, 'projects', data.projectId));
            const projectData = projectDoc.data();

            return {
              id: invoiceDoc.id,
              projectId: data.projectId,
              projectName: projectData?.name || 'Unknown Project',
              amount: data.amount,
              dueDate: data.dueDate.toDate(),
              status: data.status,
              createdAt: data.createdAt.toDate(),
            };
          })
        );

        setInvoices(invoicesData);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, [user]);

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-500';
      case 'overdue':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-yellow-500/10 text-yellow-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-red-600">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No invoices found
              </CardContent>
            </Card>
          ) : (
            invoices.map((invoice) => (
              <Card key={invoice.id} className="hover:bg-accent/5 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{invoice.projectName}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          Due {format(invoice.dueDate, 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${invoice.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </div>
  );
} 