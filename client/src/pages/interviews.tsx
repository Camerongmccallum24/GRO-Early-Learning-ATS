import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CalendarIcon, 
  PlusIcon, 
  InfoIcon 
} from "lucide-react";
import { useLocation } from "wouter";

export default function Interviews() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Placeholder data for interviews
  const interviews = [
    {
      id: 1,
      candidateName: "Emily Johnson",
      position: "Early Childhood Teacher",
      status: "scheduled",
      date: "2025-05-20T13:00:00Z",
      type: "video"
    },
    {
      id: 2,
      candidateName: "James Rodriguez",
      position: "Lead Educator",
      status: "completed",
      date: "2025-05-15T10:30:00Z",
      type: "in-person"
    },
    {
      id: 3,
      candidateName: "Sarah Wilson",
      position: "Assistant Educator",
      status: "scheduled",
      date: "2025-05-22T15:00:00Z",
      type: "video"
    }
  ];
  
  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "canceled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Canceled</Badge>;
      case "rescheduled":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Rescheduled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  
  // Filter interviews by status
  const filteredInterviews = statusFilter === "all" 
    ? interviews 
    : interviews.filter(interview => interview.status === statusFilter);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Interview Management</h1>
          <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
        </div>
        
        <Button 
          onClick={() => setLocation("/interviews/schedule")}
          className="bg-[#7356ff] hover:bg-[#634ad9]"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Schedule New Interview
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <CardTitle>Upcoming Interviews</CardTitle>
            <div className="flex items-center mt-2 sm:mt-0">
              <span className="mr-2 text-sm text-muted-foreground">Filter:</span>
              <Select 
                defaultValue="all" 
                onValueChange={value => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Interviews</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              {filteredInterviews.length 
                ? `Showing ${filteredInterviews.length} interviews` 
                : "No interviews to display"}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mb-2 opacity-20" />
                      <p>No interviews match the current filter</p>
                      {statusFilter !== "all" && (
                        <Button
                          variant="link"
                          onClick={() => setStatusFilter("all")}
                          className="mt-1"
                        >
                          View all interviews
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInterviews.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell className="font-medium">{interview.candidateName}</TableCell>
                    <TableCell>{interview.position}</TableCell>
                    <TableCell>{formatDate(interview.date)}</TableCell>
                    <TableCell className="capitalize">{interview.type}</TableCell>
                    <TableCell>{getStatusBadge(interview.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setLocation(`/interviews/${interview.id}`)}
                      >
                        <InfoIcon className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Google Calendar Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            <p className="mb-2">
              This page will integrate with Google Calendar to manage all interview scheduling for the recruitment team.
            </p>
            <p>
              The "Schedule New Interview" button takes you to the scheduling form, where you can select a date, time, and interview format.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}