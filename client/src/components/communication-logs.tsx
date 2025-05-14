import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Phone, Video, FileText } from "lucide-react";
import { format } from "date-fns";

interface CommunicationLog {
  id: number;
  candidateId: number;
  applicationId?: number;
  type: string;
  subject?: string;
  message?: string;
  direction: string;
  initiatedBy?: string;
  timestamp: Date;
  metadata?: any;
}

interface CommunicationLogsProps {
  candidateId?: number;
  applicationId?: number;
}

export function CommunicationLogs({ candidateId, applicationId }: CommunicationLogsProps) {
  const [endpoint, setEndpoint] = useState<string>("");

  // Set the endpoint based on what ID we have
  useEffect(() => {
    if (candidateId) {
      setEndpoint(`/api/candidates/${candidateId}/communications`);
    } else if (applicationId) {
      setEndpoint(`/api/applications/${applicationId}/communications`);
    }
  }, [candidateId, applicationId]);

  const { data: logs, isLoading, error } = useQuery({
    queryKey: [endpoint],
    queryFn: endpoint ? undefined : () => Promise.resolve([]),
    enabled: !!endpoint,
  });

  if (!endpoint) {
    return <div>No candidate or application ID provided.</div>;
  }

  if (isLoading) {
    return <div>Loading communication history...</div>;
  }

  if (error) {
    return <div>Error loading communication logs: {String(error)}</div>;
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
          <CardDescription>Record of all interactions with this candidate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No communication records found.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication History</CardTitle>
        <CardDescription>Record of all interactions with this candidate</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log: CommunicationLog) => (
              <TableRow key={log.id}>
                <TableCell className="w-[120px]">
                  {getTypeIcon(log.type)}
                  <span className="ml-2">{formatType(log.type)}</span>
                </TableCell>
                <TableCell className="w-[180px]">
                  {format(new Date(log.timestamp), "MMM d, yyyy h:mm a")}
                </TableCell>
                <TableCell>{log.subject || "-"}</TableCell>
                <TableCell>
                  <Badge variant={log.direction === "inbound" ? "outline" : "default"}>
                    {log.direction === "inbound" ? "Received" : "Sent"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-[300px] truncate">
                    {log.message || "No additional details"}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function getTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "email":
      return <Mail className="h-4 w-4 inline" />;
    case "call":
      return <Phone className="h-4 w-4 inline" />;
    case "note":
      return <FileText className="h-4 w-4 inline" />;
    case "video_interview":
      return <Video className="h-4 w-4 inline" />;
    case "reminder":
      return <MessageSquare className="h-4 w-4 inline" />;
    default:
      return <MessageSquare className="h-4 w-4 inline" />;
  }
}

function formatType(type: string): string {
  return type
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}