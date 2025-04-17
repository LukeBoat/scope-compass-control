import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { FileText, Clock, MessageSquare, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Deliverable } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export function PublicDeliverableView() {
  const { projectId, deliverableId } = useParams();
  const [deliverable, setDeliverable] = useState<Deliverable | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();

  useEffect(() => {
    const fetchDeliverable = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const response = await fetch(`/api/projects/${projectId}/deliverables/${deliverableId}`);
        if (!response.ok) {
          throw new Error("Deliverable not found");
        }
        const data = await response.json();
        setDeliverable(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load deliverable",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverable();
  }, [projectId, deliverableId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!deliverable) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Deliverable Not Found</h2>
          <p className="text-muted-foreground">The requested deliverable could not be found.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "In Review":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{deliverable.name}</span>
            <Badge className={getStatusColor(deliverable.status)}>
              {deliverable.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="revisions" className="flex-1">
                <History className="h-4 w-4 mr-2" />
                Revisions
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[600px] mt-4">
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Due Date</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(deliverable.dueDate), "PPP")}
                  </p>
                </div>

                {deliverable.description && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {deliverable.description}
                    </p>
                  </div>
                )}

                {deliverable.fileUrl && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Attachments</h3>
                    <a
                      href={deliverable.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      View attached file
                    </a>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="feedback" className="space-y-4">
                {deliverable.feedback.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No feedback yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {deliverable.feedback.map((feedback) => (
                      <div key={feedback.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{feedback.author}</span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(feedback.timestamp), "PPP")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {feedback.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="revisions" className="space-y-4">
                {deliverable.revisions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No revisions yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {deliverable.revisions.map((revision) => (
                      <div key={revision.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Version {revision.version}</span>
                          <Badge variant="outline">{revision.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {revision.changes}
                        </p>
                        {revision.files && revision.files.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Files:</h4>
                            <ul className="space-y-1">
                              {revision.files.map((file, index) => (
                                <li key={index} className="text-sm">
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {file.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 