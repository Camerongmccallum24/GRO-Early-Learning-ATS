import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Video, 
  FileText, 
  Calendar,
  ArrowDownIcon,
  ArrowUpIcon,
  FileIcon,
  Pencil, 
  ExternalLink,
  Search,
  Download 
} from "lucide-react";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommunicationHistoryProps {
  candidateId: number;
  applicationId?: number;
  filter?: string;
  maxItems?: number;
}

interface CommunicationLog {
  id: number;
  candidateId: number;
  applicationId?: number;
  type: string;
  subject?: string;
  message?: string;
  direction: string;
  initiatedBy?: string;
  timestamp: string;
  metadata?: any;
}

export function CommunicationHistory({ 
  candidateId, 
  applicationId,
  filter,
  maxItems
}: CommunicationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<CommunicationLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Determine the endpoint based on the available ID
  const endpoint = applicationId 
    ? `/api/applications/${applicationId}/communications` 
    : `/api/candidates/${candidateId}/communications`;
  
  // Fetch communication logs
  const { data: logs = [], isLoading, error } = useQuery<CommunicationLog[]>({
    queryKey: [endpoint],
    enabled: !!candidateId
  });
  
  // Apply filters and search
  const filteredLogs = logs.filter(log => {
    // Apply type filter if provided
    if (filter && log.type !== filter) return false;
    
    // Apply search if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (log.subject?.toLowerCase().includes(searchLower) || false) || 
        (log.message?.toLowerCase().includes(searchLower) || false)
      );
    }
    
    return true;
  });
  
  // Limit number of logs if maxItems is specified
  const displayedLogs = maxItems ? filteredLogs.slice(0, maxItems) : filteredLogs;
  
  // Get appropriate icon for the communication type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "sms":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "phone":
        return <Phone className="h-4 w-4 text-purple-500" />;
      case "video":
        return <Video className="h-4 w-4 text-red-500" />;
      case "note":
        return <Pencil className="h-4 w-4 text-gray-500" />;
      case "document":
        return <FileText className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Format the communication type for display
  const formatType = (type: string) => {
    switch (type) {
      case "email":
        return "Email";
      case "sms":
        return "SMS";
      case "phone":
        return "Phone Call";
      case "video":
        return "Video Call";
      case "note":
        return "Note";
      case "document":
        return "Document";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  // View log details
  const viewLogDetails = (log: CommunicationLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy h:mm a");
    } catch (e) {
      return "Unknown date";
    }
  };
  
  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
          <CardDescription>Record of all interactions with this candidate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-800 p-4 rounded-md">
            <p>Error loading communication logs: {String(error)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
          <CardDescription>Record of all interactions with this candidate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (displayedLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
          <CardDescription>Record of all interactions with this candidate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm 
              ? "No communication records matching your search."
              : "No communication records found."}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Search Box (Only shown if not compact) */}
      {!maxItems && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search communications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}
      
      {/* Communication Timeline */}
      <div className="space-y-4">
        {displayedLogs.map((log) => (
          <div key={log.id} className="relative pl-6 pb-8 border-l border-gray-200 dark:border-gray-700">
            {/* Timeline dot */}
            <div className="absolute left-[-8px] p-1 bg-white dark:bg-gray-800 rounded-full border-2 border-gray-200 dark:border-gray-700">
              {getTypeIcon(log.type)}
            </div>
            
            {/* Communication card */}
            <div 
              className="bg-white dark:bg-gray-800 p-4 rounded-md border shadow-sm hover:shadow-md transition-shadow cursor-pointer ml-2"
              onClick={() => viewLogDetails(log)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={log.direction === "inbound" ? "outline" : "default"}>
                    {log.direction === "inbound" ? "Received" : "Sent"}
                  </Badge>
                  <span className="font-medium">{formatType(log.type)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatTimestamp(log.timestamp)}
                </div>
              </div>
              
              {log.subject && (
                <h4 className="font-medium mb-1">{log.subject}</h4>
              )}
              
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {log.message || "No content provided"}
              </p>
              
              {/* Metadata indicators */}
              {log.metadata && (
                <div className="flex gap-2 mt-2">
                  {log.metadata.attachments && log.metadata.attachments.length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center text-xs text-gray-500">
                            <FileIcon className="h-3 w-3 mr-1" />
                            {log.metadata.attachments.length} attachment(s)
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <ul className="text-xs">
                            {log.metadata.attachments.map((a: any, i: number) => (
                              <li key={i}>{a.filename}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {log.type === "phone" && log.metadata.duration && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {log.metadata.duration}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* "Show All" button if displaying a limited set */}
      {maxItems && logs.length > maxItems && (
        <div className="text-center">
          <Button variant="ghost" size="sm">
            View All Communications ({logs.length})
          </Button>
        </div>
      )}
      
      {/* Communication Log Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getTypeIcon(selectedLog.type)}
              {selectedLog && formatType(selectedLog.type)} Details
            </DialogTitle>
            <DialogDescription>
              {selectedLog && formatTimestamp(selectedLog.timestamp)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Badge variant={selectedLog.direction === "inbound" ? "outline" : "default"}>
                  {selectedLog.direction === "inbound" ? "Received" : "Sent"}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Pencil className="h-4 w-4 mr-2" />
                      Add Note
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {selectedLog.subject && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                  <p className="font-medium">{selectedLog.subject}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Content</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md whitespace-pre-line border">
                  {selectedLog.message || "No content available"}
                </div>
              </div>
              
              {/* Metadata display */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Additional Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedLog.type === "phone" && selectedLog.metadata.duration && (
                      <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm">{selectedLog.metadata.duration}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedLog.type === "phone" && selectedLog.metadata.outcome && (
                      <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Outcome</p>
                          <p className="text-sm">{selectedLog.metadata.outcome}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedLog.metadata.phoneNumber && (
                      <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Phone Number</p>
                          <p className="text-sm">{selectedLog.metadata.phoneNumber}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedLog.initiatedBy && (
                      <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Initiated By</p>
                          <p className="text-sm">{selectedLog.initiatedBy}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Attachments */}
                  {selectedLog.metadata.attachments && selectedLog.metadata.attachments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Attachments</h3>
                      <div className="space-y-2">
                        {selectedLog.metadata.attachments.map((attachment: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-md border">
                            <div className="flex items-center">
                              <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
                              <div>
                                <p className="text-sm">{attachment.filename}</p>
                                <p className="text-xs text-gray-500">{attachment.size} bytes</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}