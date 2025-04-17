import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, Send, Download, Clock, CheckCircle, AlertCircle, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Invoice, InvoiceLineItem, Deliverable, Milestone, InvoiceStatus } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface InvoiceEditorProps {
  invoice?: Invoice;
  projectId: string;
  milestones: Milestone[];
  deliverables: Deliverable[];
  onSave: (invoice: Invoice) => void;
  onSend: (invoice: Invoice) => void;
  onExport: (invoice: Invoice) => void;
  onUpdateStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

export function InvoiceEditor({
  invoice,
  projectId,
  milestones,
  deliverables,
  onSave,
  onSend,
  onExport,
  onUpdateStatus
}: InvoiceEditorProps) {
  const [editedInvoice, setEditedInvoice] = useState<Invoice>(invoice || {
    id: crypto.randomUUID(),
    projectId,
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    lineItems: [],
    total: 0,
    status: "Draft" as InvoiceStatus,
    notes: ""
  });
  
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InvoiceLineItem>>({
    id: crypto.randomUUID(),
    label: "",
    amount: 0,
    type: "deliverable",
    description: ""
  });
  
  const [selectedMilestone, setSelectedMilestone] = useState<string | undefined>(invoice?.milestoneId);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Calculate total when line items change
  useEffect(() => {
    const total = editedInvoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
    setEditedInvoice(prev => ({ ...prev, total }));
  }, [editedInvoice.lineItems]);

  const handleAddItem = () => {
    if (!newItem.label || !newItem.amount) return;
    
    setEditedInvoice(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem as InvoiceLineItem]
    }));
    
    setShowAddItemDialog(false);
    setNewItem({
      id: crypto.randomUUID(),
      label: "",
      amount: 0,
      type: "deliverable",
      description: ""
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setEditedInvoice(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== itemId)
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(editedInvoice);
      
      // Show success toast with animation
      toast.success("Invoice saved successfully", {
        duration: 3000,
        className: "bg-green-50 border-green-200",
        description: "Your changes have been saved.",
        action: {
          label: "View",
          onClick: () => {/* Handle view action */}
        }
      });
    } catch (error) {
      toast.error("Failed to save invoice", {
        duration: 3000,
        className: "bg-red-50 border-red-200",
        description: "Please try again later."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = () => {
    if (!clientEmail) return;
    onSend(editedInvoice);
    setShowSendDialog(false);
  };

  const handleExport = () => {
    onExport(editedInvoice);
  };

  const handleUpdateStatus = (status: InvoiceStatus) => {
    if (editedInvoice.id) {
      onUpdateStatus(editedInvoice.id, status);
      setEditedInvoice(prev => ({ ...prev, status }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-gray-500/10 text-gray-500";
      case "sent":
        return "bg-blue-500/10 text-blue-500";
      case "paid":
        return "bg-green-500/10 text-green-500";
      case "overdue":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return <Clock className="h-4 w-4" />;
      case "sent":
        return <Send className="h-4 w-4" />;
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Filter deliverables by milestone
  const filteredDeliverables = selectedMilestone
    ? deliverables.filter(d => d.milestoneId === selectedMilestone)
    : deliverables.filter(d => d.status === "Approved");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            {invoice ? `Edit Invoice ${invoice.id}` : "New Invoice"}
          </h2>
          <p className="text-muted-foreground">
            {invoice ? "Update invoice details" : "Create a new invoice"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editedInvoice.id && (
            <>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => setShowSendDialog(true)}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </>
          )}
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="relative"
          >
            <AnimatePresence mode="wait">
              {isSaving ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="save"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={format(new Date(editedInvoice.dueDate), "yyyy-MM-dd")}
                onChange={(e) =>
                  setEditedInvoice(prev => ({
                    ...prev,
                    dueDate: new Date(e.target.value).toISOString()
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Milestone</Label>
              <Select
                value={selectedMilestone}
                onValueChange={(value) => {
                  setSelectedMilestone(value);
                  setEditedInvoice(prev => ({ ...prev, milestoneId: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a milestone" />
                </SelectTrigger>
                <SelectContent>
                  {milestones.map((milestone) => (
                    <SelectItem key={milestone.id} value={milestone.id}>
                      {milestone.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editedInvoice.notes}
                onChange={(e) =>
                  setEditedInvoice(prev => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Add any notes or special instructions..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowAddItemDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {editedInvoice.lineItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items added yet
                </div>
              ) : (
                <div className="space-y-4">
                  {editedInvoice.lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-medium">${item.amount.toLocaleString()}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">${editedInvoice.total.toLocaleString()}</p>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Line Item</DialogTitle>
            <DialogDescription>
              Add a new item to the invoice
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Item Label</Label>
              <Input
                value={newItem.label}
                onChange={(e) =>
                  setNewItem(prev => ({ ...prev, label: e.target.value }))
                }
                placeholder="Enter item label"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={newItem.amount || ""}
                onChange={(e) =>
                  setNewItem(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
                }
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newItem.description}
                onChange={(e) =>
                  setNewItem(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter item description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
            <DialogDescription>
              Send this invoice to the client
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Client Email</Label>
              <Input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Enter client email"
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={sendMessage}
                onChange={(e) => setSendMessage(e.target.value)}
                placeholder="Add a message to the client..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend}>Send Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 