import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Plus, Clock, ArrowRight, GitCompare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScopeChange, ScopeChangeType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface ScopeChangeTrackerProps {
  projectId: string;
  deliverables?: { id: string; name: string }[];
}

export function ScopeChangeTracker({ projectId, deliverables = [] }: ScopeChangeTrackerProps) {
  const [scopeChanges, setScopeChanges] = useState<ScopeChange[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newChange, setNewChange] = useState<Partial<ScopeChange>>({
    type: "Addition",
    description: "",
    deliverableId: undefined,
  });
  const [isLoading, setIsLoading] = useState(true);

  const handleCreateChange = () => {
    if (!newChange.type || !newChange.description) return;

    const change: ScopeChange = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      type: newChange.type as ScopeChangeType,
      description: newChange.description,
      createdAt: new Date().toISOString(),
      createdBy: "Current User", // This should come from auth context
      deliverableId: newChange.deliverableId,
    };

    setScopeChanges((prev) => [change, ...prev]);
    setNewChange({ type: "Addition", description: "", deliverableId: undefined });
    setIsDialogOpen(false);
  };

  const getTypeBadgeVariant = (type: ScopeChangeType) => {
    switch (type) {
      case "Addition":
        return "default";
      case "Removal":
        return "destructive";
      case "Update":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!scopeChanges || scopeChanges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          <GitCompare className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Scope Changes Yet</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Scope changes will be tracked here when you make modifications to project deliverables, milestones, or other project elements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Scope Changes</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Log Scope Change
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Scope Change</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Change Type</Label>
                <Select
                  value={newChange.type}
                  onValueChange={(value: ScopeChangeType) =>
                    setNewChange((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Addition">Addition</SelectItem>
                    <SelectItem value="Removal">Removal</SelectItem>
                    <SelectItem value="Update">Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newChange.description}
                  onChange={(e) =>
                    setNewChange((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe the scope change..."
                  rows={4}
                />
              </div>
              {deliverables.length > 0 && (
                <div className="space-y-2">
                  <Label>Link to Deliverable (Optional)</Label>
                  <Select
                    value={newChange.deliverableId}
                    onValueChange={(value) =>
                      setNewChange((prev) => ({ ...prev, deliverableId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a deliverable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {deliverables.map((deliverable) => (
                        <SelectItem key={deliverable.id} value={deliverable.id}>
                          {deliverable.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateChange}
                disabled={!newChange.type || !newChange.description}
              >
                Log Change
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4 space-y-4">
          <AnimatePresence>
            {scopeChanges.length > 0 ? (
              scopeChanges.map((change) => (
                <motion.div
                  key={change.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getTypeBadgeVariant(change.type)}>
                          {change.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(change.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{change.description}</p>
                      {change.deliverableId && (
                        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                          <ArrowRight className="h-4 w-4" />
                          Linked to:{" "}
                          {deliverables.find((d) => d.id === change.deliverableId)?.name}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No scope changes logged yet</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
} 