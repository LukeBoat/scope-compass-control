import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useInvoices } from '@/hooks/useInvoices';
import { useProject } from '@/hooks/useProject';
import { InvoiceEditor } from '@/components/InvoiceEditor';
import { InvoiceList } from '@/components/InvoiceList';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, FileText } from 'lucide-react';
import { Invoice, InvoiceStatus } from '@/types';
import { toast } from 'sonner';
import { usePageTitle } from '@/hooks/usePageTitle';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

// Add type declaration for jsPDF with autoTable plugin
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function ProjectInvoices() {
  const { projectId = '' } = useParams();
  const { project, loading: projectLoading } = useProject(projectId);
  const { invoices, loading: invoicesLoading, error, createInvoice, updateInvoice, deleteInvoice } = useInvoices(projectId);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Set page title
  usePageTitle(project ? `${project.name} - Invoices` : "Invoices");

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
    try {
      setIsExporting(true);
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add company logo
      const logo = new Image();
      logo.src = '/logo.png';
      doc.addImage(logo, 'PNG', 20, 10, 40, 20);
      
      // Add company details
      doc.setFontSize(24);
      doc.setTextColor(66, 66, 66);
      doc.text("ScopeSentinel", 70, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("123 Business Street", 70, 35);
      doc.text("City, State 12345", 70, 40);
      doc.text("contact@scopesentinel.com", 70, 45);
      
      // Add invoice details
      doc.setFontSize(20);
      doc.setTextColor(66, 66, 66);
      doc.text("INVOICE", 150, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Invoice #: ${invoice.id}`, 150, 35);
      doc.text(`Date: ${format(new Date(invoice.createdAt), "MMM dd, yyyy")}`, 150, 40);
      doc.text(`Due Date: ${format(new Date(invoice.dueDate), "MMM dd, yyyy")}`, 150, 45);
      
      // Add client details
      doc.setFontSize(12);
      doc.setTextColor(66, 66, 66);
      doc.text("Bill To:", 20, 60);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(project?.clientName || "Client", 20, 70);
      doc.text(project?.name || "Project", 20, 75);
      
      // Add line items table
      const tableData = invoice.lineItems.map(item => [
        item.label,
        item.description || "",
        formatCurrency(item.amount)
      ]);
      
      doc.autoTable({
        startY: 90,
        head: [["Description", "Details", "Amount"]],
        body: tableData,
        foot: [[
          "Total",
          "",
          formatCurrency(invoice.total)
        ]],
        theme: "grid",
        headStyles: { 
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold"
        },
        bodyStyles: {
          fontSize: 10,
          textColor: [100, 100, 100]
        },
        footStyles: { 
          fillColor: [240, 240, 240],
          textColor: [66, 66, 66],
          fontSize: 10,
          fontStyle: "bold"
        },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 60 },
          2: { cellWidth: 40, halign: "right" }
        }
      });
      
      // Add notes if any
      if (invoice.notes) {
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(12);
        doc.setTextColor(66, 66, 66);
        doc.text("Notes:", 20, finalY);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const splitNotes = doc.splitTextToSize(invoice.notes, 170);
        doc.text(splitNotes, 20, finalY + 10);
      }
      
      // Save the PDF
      doc.save(`invoice-${invoice.id}.pdf`);
      
      toast.success("Invoice exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export invoice", {
        description: "Please try again later"
      });
    } finally {
      setIsExporting(false);
    }
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

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <div className="rounded-full bg-brand-purple/10 p-4 mb-4">
            <FileText className="h-8 w-8 text-brand-purple" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Invoices Yet</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Create invoices to track payments and manage your project finances. Add your first invoice to get started.
          </p>
          <Button 
            className="bg-brand-purple hover:bg-brand-purple-dark"
            onClick={handleCreateInvoice}
          >
            Create First Invoice
          </Button>
        </div>
      ) : (
        <InvoiceList
          invoices={invoices}
          onCreateInvoice={handleCreateInvoice}
          onUpdateInvoice={handleSaveInvoice}
          onDeleteInvoice={deleteInvoice}
        />
      )}

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