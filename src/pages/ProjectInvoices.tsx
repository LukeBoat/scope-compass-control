import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useInvoices } from '@/hooks/useInvoices';
import { useProject } from '@/hooks/useProject';
import { InvoiceEditor } from '@/components/InvoiceEditor';
import { InvoiceList } from '@/components/InvoiceList';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle } from 'lucide-react';
import { Invoice, InvoiceStatus } from '@/types';
import { toast } from 'sonner';

export default function ProjectInvoices() {
  const { projectId = '' } = useParams();
  const { project, loading: projectLoading } = useProject(projectId);
  const { invoices, loading: invoicesLoading, error, createInvoice, updateInvoice, deleteInvoice } = useInvoices(projectId);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setShowInvoiceDialog(true);
  };

  const handleSaveInvoice = async (invoice: Invoice) => {
    try {
      if (selectedInvoice) {
        await updateInvoice(selectedInvoice.id, invoice);
        toast.success('Invoice updated successfully');
      } else {
        await createInvoice(invoice);
        toast.success('Invoice created successfully');
      }
      setShowInvoiceDialog(false);
    } catch (err) {
      toast.error('Failed to save invoice');
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, { 
        status: 'Sent' as InvoiceStatus, 
        sentAt: new Date().toISOString() 
      });
      toast.success('Invoice sent successfully');
    } catch (err) {
      toast.error('Failed to send invoice');
    }
  };

  const handleExportInvoice = async (invoice: Invoice) => {
    // TODO: Implement PDF export
    toast.info('PDF export will be implemented soon');
  };

  const handleUpdateStatus = async (invoiceId: string, status: InvoiceStatus) => {
    try {
      await updateInvoice(invoiceId, { status });
      toast.success('Invoice status updated successfully');
    } catch (err) {
      toast.error('Failed to update invoice status');
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error loading invoices: {error.message}
        </div>
      </div>
    );
  }

  if (projectLoading || invoicesLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Project Invoices</h1>
        <Button onClick={handleCreateInvoice}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <InvoiceList
        invoices={invoices}
        projectId={projectId}
        milestones={project?.milestones || []}
        deliverables={project?.deliverables || []}
        onSave={handleSaveInvoice}
        onSend={handleSendInvoice}
        onExport={handleExportInvoice}
        onUpdateStatus={handleUpdateStatus}
        onCreateInvoice={handleCreateInvoice}
      />

      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-4xl">
          <InvoiceEditor
            invoice={selectedInvoice || undefined}
            projectId={projectId}
            milestones={project?.milestones || []}
            deliverables={project?.deliverables || []}
            onSave={handleSaveInvoice}
            onSend={handleSendInvoice}
            onExport={handleExportInvoice}
            onUpdateStatus={handleUpdateStatus}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 