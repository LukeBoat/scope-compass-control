import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, Check, X, Flag } from "lucide-react";
import { Revision } from "@/types";

interface RevisionHistoryProps {
  revisions: Revision[];
  onApprove?: (revision: Revision) => void;
  onReject?: (revision: Revision) => void;
  onMarkFinal?: (revision: Revision) => void;
  onSelectRevision?: (revision: Revision) => void;
}

export function RevisionHistory({
  revisions,
  onApprove,
  onReject,
  onMarkFinal,
  onSelectRevision,
}: RevisionHistoryProps) {
  const getStatusBadgeVariant = (status: Revision["status"]) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "final":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: Revision["status"]) => {
    switch (status) {
      case "approved":
        return <Check className="h-4 w-4" />;
      case "rejected":
        return <X className="h-4 w-4" />;
      case "final":
        return <Flag className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Revision History</h3>
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {revisions.map((revision) => (
            <Card
              key={revision.id}
              className={`p-4 transition-colors ${
                onSelectRevision ? "cursor-pointer hover:bg-muted/50" : ""
              }`}
              onClick={() => onSelectRevision?.(revision)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Version {revision.version}</span>
                  <Badge variant={getStatusBadgeVariant(revision.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(revision.status)}
                      <span>{revision.status}</span>
                    </div>
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(revision.date, "PPP")}
                </span>
              </div>
              <p className="text-sm mb-4">{revision.changes}</p>
              <div className="space-y-2">
                {revision.files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileText className="h-4 w-4" />
                      {file.name}
                    </a>
                    <span className="text-sm text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ))}
              </div>
              {revision.status === "pending" && onApprove && onReject && (
                <div className="mt-4 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject(revision);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove(revision);
                    }}
                  >
                    Approve
                  </Button>
                </div>
              )}
              {revision.status === "approved" && onMarkFinal && (
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkFinal(revision);
                  }}
                >
                  Mark as Final
                </Button>
              )}
              {revision.status === "rejected" && revision.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-600">
                    Rejection reason: {revision.rejectionReason}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
} 