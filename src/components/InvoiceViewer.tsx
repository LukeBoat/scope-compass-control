import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Download, Send, Clock, CheckCircle, AlertCircle, DollarSign, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Invoice, InvoiceStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";
import { initiatePayment } from "@/services/paymentService";

// Add type declaration for jsPDF with autoTable plugin
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface InvoiceViewerProps {
  invoice: Invoice;
  projectName: string;
  clientName: string;
  onExport: (invoice: Invoice) => void;
  onSend: (invoice: Invoice) => void;
  onUpdateStatus?: (invoiceId: string, status: InvoiceStatus) => void;
}

const statusColors: Record<InvoiceStatus, { bg: string; text: string }> = {
  Draft: { bg: "bg-brand-muted-gray", text: "text-brand-neutral-dark" },
  Sent: { bg: "bg-brand-blue-light/10", text: "text-brand-blue" },
  Paid: { bg: "bg-brand-status-success/10", text: "text-brand-status-success" },
  Overdue: { bg: "bg-brand-status-error/10", text: "text-brand-status-error" }
};

const statusIcons: Record<InvoiceStatus, typeof Clock> = {
  Draft: Clock,
  Sent: Send,
  Paid: CheckCircle,
  Overdue: AlertCircle
};

export function InvoiceViewer({ invoice, projectName, clientName, onExport, onSend, onUpdateStatus }: InvoiceViewerProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add company logo
      const logo = new Image();
      logo.src = '/logo.png'; // Make sure to add your logo to the public folder
      doc.addImage(logo, 'PNG', 20, 10, 40, 20);
      
      // Add company details with improved styling
      doc.setFontSize(24);
      doc.setTextColor(66, 66, 66);
      doc.text("ScopeSentinel", 70, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("123 Business Street", 70, 35);
      doc.text("City, State 12345", 70, 40);
      doc.text("contact@scopesentinel.com", 70, 45);
      
      // Add invoice details with improved styling
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
      doc.text(clientName, 20, 70);
      doc.text(projectName, 20, 75);
      
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
      if (invoice.notes || invoice.paymentInstructions || invoice.termsAndConditions) {
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(12);
        doc.setTextColor(66, 66, 66);
        
        if (invoice.paymentInstructions) {
          doc.text("Payment Instructions:", 20, finalY);
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          const splitInstructions = doc.splitTextToSize(invoice.paymentInstructions, 170);
          doc.text(splitInstructions, 20, finalY + 10);
        }
        
        if (invoice.termsAndConditions) {
          const termsY = invoice.paymentInstructions ? finalY + 30 : finalY;
          doc.setFontSize(12);
          doc.setTextColor(66, 66, 66);
          doc.text("Terms & Conditions:", 20, termsY);
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          const splitTerms = doc.splitTextToSize(invoice.termsAndConditions, 170);
          doc.text(splitTerms, 20, termsY + 10);
        }
        
        if (invoice.notes) {
          const notesY = invoice.termsAndConditions ? finalY + 60 : finalY;
          doc.setFontSize(12);
          doc.setTextColor(66, 66, 66);
          doc.text("Additional Notes:", 20, notesY);
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          const splitNotes = doc.splitTextToSize(invoice.notes, 170);
          doc.text(splitNotes, 20, notesY + 10);
        }
      }
      
      // Add recurring information if applicable
      if (invoice.isRecurring && invoice.recurringInterval) {
        const finalY = invoice.notes || invoice.paymentInstructions || invoice.termsAndConditions 
          ? (doc as any).lastAutoTable.finalY + 100 
          : (doc as any).lastAutoTable.finalY + 20;
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Recurring Invoice - ${invoice.recurringInterval}`, 20, finalY);
      }
      
      // Add status
      const finalY = invoice.isRecurring 
        ? (doc as any).lastAutoTable.finalY + 30 
        : (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Status: ${invoice.status}`, 20, finalY);
      
      // Save the PDF
      doc.save(`invoice-${invoice.id}.pdf`);
      
      onExport(invoice);
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

  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true);
      await initiatePayment(
        invoice.id,
        invoice.total,
        invoice.currency || 'usd'
      );
      toast.success('Redirecting to payment page', {
        description: 'Please complete your payment in the new window'
      });
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment', {
        description: error instanceof Error ? error.message : 'Please try again later'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const StatusIcon = statusIcons[invoice.status];
  const statusColor = statusColors[invoice.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Invoice #{invoice.id}</CardTitle>
              <p className="text-muted-foreground">{projectName}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={`${statusColor.bg} ${statusColor.text} flex items-center gap-1`}>
                <StatusIcon className="h-4 w-4" />
                {invoice.status}
              </Badge>
              <Button
                variant="outline"
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </>
                )}
              </Button>
              {invoice.status === "Draft" && (
                <Button onClick={() => onSend(invoice)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invoice
                </Button>
              )}
              {invoice.status === "Sent" && (
                <Button 
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                  className="bg-brand-green hover:bg-brand-green-dark"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Client</h3>
              <p className="text-muted-foreground">{clientName}</p>
              <p className="text-muted-foreground">{projectName}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Invoice Details</h3>
              <p className="text-muted-foreground">
                Created: {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
              </p>
              <p className="text-muted-foreground">
                Due Date: {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-4">Line Items</h3>
            <div className="space-y-4">
              {invoice.lineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{item.label}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <p className="font-medium">{formatCurrency(item.amount)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-start">
            <div>
              {invoice.notes && (
                <div className="space-y-2">
                  <h3 className="font-medium">Notes</h3>
                  <p className="text-muted-foreground">{invoice.notes}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(invoice.total)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 