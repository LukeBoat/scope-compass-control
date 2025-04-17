import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Check, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Invoice, InvoiceStatus } from '@/types';

interface InvoiceClientViewProps {
  invoice: Invoice;
  onDownload?: () => void;
}

const statusColors: Record<InvoiceStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  Draft: { 
    bg: "bg-brand-muted-gray", 
    text: "text-brand-neutral-dark",
    icon: <Clock className="h-3 w-3 mr-1" />
  },
  Sent: { 
    bg: "bg-brand-blue-light/10", 
    text: "text-brand-blue",
    icon: <FileText className="h-3 w-3 mr-1" />
  },
  Paid: { 
    bg: "bg-brand-status-success/10", 
    text: "text-brand-status-success",
    icon: <Check className="h-3 w-3 mr-1" />
  },
  Overdue: { 
    bg: "bg-brand-status-error/10", 
    text: "text-brand-status-error",
    icon: <AlertCircle className="h-3 w-3 mr-1" />
  }
};

export function InvoiceClientView({ invoice, onDownload }: InvoiceClientViewProps) {
  const statusStyle = statusColors[invoice.status];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-brand-card-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-display">Invoice #{invoice.id.slice(0, 8)}</CardTitle>
              <CardDescription>
                Created on {format(new Date(invoice.createdAt), "MMMM dd, yyyy")}
              </CardDescription>
            </div>
            <Badge className={`${statusStyle.bg} ${statusStyle.text} px-3 py-1`}>
              {statusStyle.icon}
              {invoice.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Due Date</h3>
                <p className="text-lg">
                  {format(new Date(invoice.dueDate), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Amount</h3>
                <p className="text-2xl font-semibold text-brand-blue">
                  {formatCurrency(invoice.total)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Line Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Line Items</h3>
              <div className="space-y-4">
                {invoice.lineItems.map((item, index) => (
                  <div key={index} className="flex items-start justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                    <p className="font-medium">{formatCurrency(item.amount)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Notes</h3>
                  <p className="text-muted-foreground">{invoice.notes}</p>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                className="hover:bg-brand-muted-gray"
                onClick={onDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 