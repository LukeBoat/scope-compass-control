
import { useState } from "react";
import { Project, Revision, Deliverable } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, Plus } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

interface ProjectRevisionsProps {
  project: Project;
}

export function ProjectRevisions({ project }: ProjectRevisionsProps) {
  const [open, setOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<string>("");
  const [revisionNote, setRevisionNote] = useState<string>("");

  // Get all revisions across all deliverables
  const getAllRevisions = () => {
    const allRevisions: Array<Revision & { deliverableName: string }> = [];
    
    project.deliverables.forEach(deliverable => {
      deliverable.revisions.forEach(revision => {
        allRevisions.push({
          ...revision,
          deliverableName: deliverable.name
        });
      });
    });
    
    // Sort by date (newest first)
    return allRevisions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  const handleAddRevision = () => {
    // Here you would typically add the revision to the database
    // For now, we'll just close the dialog
    setOpen(false);
    setSelectedDeliverable("");
    setRevisionNote("");
  };

  const allRevisions = getAllRevisions();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Revision History</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-purple hover:bg-brand-purple-dark">
              <Plus className="h-4 w-4 mr-2" />
              Log Revision
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log a New Revision</DialogTitle>
              <DialogDescription>
                Track a revision to keep count of your scope limits.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Deliverable</label>
                <Select value={selectedDeliverable} onValueChange={setSelectedDeliverable}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a deliverable" />
                  </SelectTrigger>
                  <SelectContent>
                    {project.deliverables.map((deliverable) => (
                      <SelectItem key={deliverable.id} value={deliverable.id}>
                        {deliverable.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Revision Notes</label>
                <Textarea
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Describe the changes made in this revision"
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                className="bg-brand-purple hover:bg-brand-purple-dark"
                onClick={handleAddRevision}
                disabled={!selectedDeliverable || !revisionNote}
              >
                Save Revision
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-muted/40 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Revision Limit</span>
        </div>
        <div className="text-lg font-semibold">
          <span className={project.revisionsUsed >= project.revisionLimit ? "text-red-600" : ""}>
            {project.revisionsUsed}
          </span>
          <span className="text-muted-foreground">/{project.revisionLimit}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {allRevisions.length > 0 ? (
          allRevisions.map((revision, index) => (
            <Card key={revision.id} className="overflow-hidden">
              <CardHeader className="bg-muted/20 py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{revision.deliverableName}</CardTitle>
                  <span className="text-xs text-muted-foreground">{formatDate(revision.date)}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm">{revision.notes}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium">No revisions yet</h3>
            <p className="text-muted-foreground mb-4">Start tracking revisions to manage your project scope.</p>
            <Button 
              className="bg-brand-purple hover:bg-brand-purple-dark"
              onClick={() => setOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Log First Revision
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
