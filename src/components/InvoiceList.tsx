import { useState } from "react";
import { motion } from "framer-motion";
import { Invoice, InvoiceStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InvoiceEditor } from "./InvoiceEditor";
import { formatCurrency } from "@/lib/utils";
import { Send, FileText, Copy, Eye } from "lucide-react";

interface InvoiceListProps {
  invoices: Invoice[];
  onCreateInvoice: () => void;
  onUpdateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
}

const statusColors: Record<InvoiceStatus, { bg: string; text: string }> = {
  Draft: { bg: "bg-brand-muted-gray", text: "text-brand-neutral-dark" },
  Sent: { bg: "bg-brand-blue-light/10", text: "text-brand-blue" },
  Paid: { bg: "bg-brand-status-success/10", text: "text-brand-status-success" },
  Overdue: { bg: "bg-brand-status-error/10", text: "text-brand-status-error" }
};

export function InvoiceList({ invoices, onCreateInvoice, onUpdateInvoice, onDeleteInvoice }: InvoiceListProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditorOpen(true);
  };

  const handleSendInvoice = (invoice: Invoice) => {
    onUpdateInvoice({ ...invoice, status: "Sent" as InvoiceStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-2 font-display">Invoices</h2>
        <Button onClick={onCreateInvoice} className="btn-primary">
          Create Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-brand-purple/10 p-4 mb-4">
            <FileText className="h-8 w-8 text-brand-purple" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Invoices Yet</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Start managing your project finances by creating your first invoice.
          </p>
          <Button onClick={onCreateInvoice}>Create First Invoice</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-brand-neutral-dark">
                      Invoice #{invoice.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Created on {new Date(invoice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    className={`${statusColors[invoice.status].bg} ${statusColors[invoice.status].text}`}
                  >
                    {invoice.status}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Due Date</span>
                    <p className="font-medium">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <p className="font-medium text-brand-blue">
                      {formatCurrency(invoice.total)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Items</span>
                    <p className="font-medium">
                      {invoice.lineItems.length} items
                    </p>
                  </div>
                </div>

                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-brand-blue"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Details</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {invoice.status === "Draft" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-brand-blue"
                            onClick={() => handleSendInvoice(invoice)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send Invoice</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-brand-blue"
                          disabled={true}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Coming Soon</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-brand-blue"
                          onClick={() => {/* Handle duplicate */}}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Duplicate</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {selectedInvoice && (
        <InvoiceEditor
          invoice={selectedInvoice}
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          onSave={onUpdateInvoice}
          onDelete={onDeleteInvoice}
        />
      )}
    </div>
  );
} 