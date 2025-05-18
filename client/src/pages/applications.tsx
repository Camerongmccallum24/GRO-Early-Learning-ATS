import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { ApplicationStatusBadge } from "@/components/application-status-badge";
import { SearchIcon, Filter, MoreHorizontal, Mail, X, Phone } from "lucide-react";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EmailForm } from "@/components/email-form";
import { CommunicationManager } from "@/components/communication/communication-manager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Applications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [applicationDetail, setApplicationDetail] = useState<any>(null);
  const [updateStatusDialog, setUpdateStatusDialog] = useState<{ id: number, status: string } | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Handle application ID from URL query params (for deep linking from dashboard)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appId = params.get('id');
    
    if (appId) {
      // Wait for applications to load, then find the one that matches the ID
      const findAndShowApplication = () => {
        const apps = queryClient.getQueryData<any[]>(['/api/applications']);
        if (apps && apps.length > 0) {
          const app = apps.find(a => a.id.toString() === appId);
          if (app) {
            setApplicationDetail(app);
          }
        }
      };
      
      // Check if we already have the data
      findAndShowApplication();
      
      // If not, subscribe to the query cache to know when the data is available
      const unsubscribe = queryClient.getQueryCache().subscribe(() => {
        findAndShowApplication();
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [queryClient]);

  // Fetch applications with any filters
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["/api/applications", { status: statusFilter, locationId: locationFilter }],
    queryFn: async ({ queryKey }) => {
      const [_, filterParams] = queryKey as [string, { status?: string, locationId?: string | number }];
      const params = new URLSearchParams();
      
      if (filterParams.status && filterParams.status !== 'all') params.append("status", String(filterParams.status));
      if (filterParams.locationId && filterParams.locationId !== 'all') params.append("locationId", String(filterParams.locationId));
      
      const url = `/api/applications${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, { credentials: "include" });
      
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      
      return response.json();
    },
  });

  // Fetch locations for filter
  const { data: locations = [] } = useQuery<any[]>({
    queryKey: ["/api/locations"],
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      return apiRequest("PATCH", `/api/applications/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-applications"] });
      toast({
        title: "Application status updated successfully",
      });
      setUpdateStatusDialog(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating application status",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  // Filter applications based on search term
  const filteredApplications = useMemo(() => {
    if (!searchTerm) return applications;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return applications.filter((application: any) => {
      return (
        application.candidate?.name?.toLowerCase().includes(lowerSearchTerm) ||
        application.candidate?.email?.toLowerCase().includes(lowerSearchTerm) ||
        application.jobPosting?.title?.toLowerCase().includes(lowerSearchTerm) ||
        application.jobPosting?.location?.name?.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [applications, searchTerm]);

  const handleViewDetails = (application: any) => {
    setApplicationDetail(application);
    setShowEmailForm(false); // Reset email form state when opening the dialog
  };

  const handleUpdateStatus = (id: number, status: string) => {
    setUpdateStatusDialog({ id, status });
  };

  const confirmUpdateStatus = () => {
    if (updateStatusDialog) {
      updateStatusMutation.mutate(updateStatusDialog);
    }
  };

  const handleApplyFilters = () => {
    setShowFilterDialog(false);
  };

  const clearFilters = () => {
    setStatusFilter("");
    setLocationFilter("");
    setShowFilterDialog(false);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 pb-16">
      {/* Page Title (only visible on desktop) */}
      <div className="bg-white border-b border-gray-200 md:flex md:items-center md:justify-between p-4 md:py-2 md:px-6 md:h-16 hidden">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium leading-6 text-[#172B4D]">Applications</h1>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by candidate name, position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilterDialog(true)}>
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {(statusFilter || locationFilter) && (
            <span className="ml-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Applications Table */}
      <Card className="shadow overflow-hidden">
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-lg">All Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((application: any) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <div className="text-gray-600 font-medium">
                              {application.candidate?.name?.charAt(0) || "?"}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.candidate?.name || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.candidate?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{application.jobPosting?.title || "Unknown Position"}</TableCell>
                      <TableCell>{application.jobPosting?.location?.name || "Unknown Location"}</TableCell>
                      <TableCell>
                        <ApplicationStatusBadge status={application.status} />
                      </TableCell>
                      <TableCell>{formatDate(application.applicationDate)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(application)}>View Details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, "applied")}>
                              Applied
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, "in_review")}>
                              In Review
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, "interview")}>
                              Interview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, "interviewed")}>
                              Interviewed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, "offered")}>
                              Offered
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, "hired")}>
                              Hired
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, "rejected")}>
                              Rejected
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Applications</DialogTitle>
            <DialogDescription>
              Narrow down the applications based on specific criteria.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-filter">Location</Label>
              <Select
                value={locationFilter}
                onValueChange={setLocationFilter}
              >
                <SelectTrigger id="location-filter">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location: any) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
            <Button
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Detail Dialog */}
      <Dialog 
        open={!!applicationDetail} 
        onOpenChange={(open) => {
          if (!open) {
            setApplicationDetail(null);
            setShowEmailForm(false);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader className="flex justify-between items-start">
            <div>
              <DialogTitle>Candidate Application</DialogTitle>
              <DialogDescription>
                {applicationDetail?.candidate?.name || "Candidate"}'s details
              </DialogDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setApplicationDetail(null);
                setShowEmailForm(false);
              }}
              className="h-8 w-8 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          {applicationDetail && (
            <div className="mt-4">
              {/* Communication Manager */}
              {showEmailForm && applicationDetail.candidate && (
                <div className="mb-6">
                  <CommunicationManager
                    applicationId={applicationDetail.id}
                    candidateId={applicationDetail.candidate.id}
                    candidateName={applicationDetail.candidate?.name || "Candidate"}
                    candidateEmail={applicationDetail.candidate?.email}
                    candidatePhone={applicationDetail.candidate?.phone}
                    applicationStatus={applicationDetail.status}
                    jobTitle={applicationDetail.jobPosting?.title}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    Candidate Information
                    <div className="ml-2">
                      <Button 
                        size="sm" 
                        variant={showEmailForm ? "default" : "outline"}
                        className={showEmailForm ? "bg-blue-600 hover:bg-blue-700" : ""}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEmailForm(!showEmailForm);
                        }}
                      >
                        {showEmailForm ? "Hide Communication" : "Contact Candidate"}
                      </Button>
                    </div>
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <div className="text-gray-600 font-medium">
                          {applicationDetail.candidate?.name?.charAt(0) || "?"}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-base font-medium">
                          {applicationDetail.candidate?.name || "Unknown"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {applicationDetail.candidate?.email || "No email"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-gray-600">
                          {applicationDetail.candidate?.phone || "Not provided"}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Applied On</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(applicationDetail.applicationDate)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <div className="mt-1">
                          <ApplicationStatusBadge status={applicationDetail.status} />
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Source</p>
                        <p className="text-sm text-gray-600">
                          {applicationDetail.source === "direct" ? "Direct Application" : applicationDetail.source}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => setUpdateStatusDialog({ 
                          id: applicationDetail.id, 
                          status: applicationDetail.status 
                        })}
                      >
                        Update Status
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Position Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-base font-medium">
                          {applicationDetail.jobPosting?.title || "Unknown Position"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {applicationDetail.jobPosting?.location?.name || "Unknown"}
                        </p>
                      </div>
                      <ApplicationStatusBadge status={applicationDetail.status} />
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-4 border-t pt-3">
                      <div>
                        <span className="font-medium">Applied:</span> {formatDate(applicationDetail.applicationDate || applicationDetail.createdAt)}
                      </div>
                      {applicationDetail.jobPosting?.type && (
                        <div>
                          <span className="font-medium">Type:</span> {applicationDetail.jobPosting?.type}
                        </div>
                      )}
                    </div>
                      
                    {applicationDetail.notes && (
                      <div className="mb-2">
                        <p className="text-sm font-medium">Candidate Notes</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3 whitespace-pre-line">
                          {applicationDetail.notes}
                        </p>
                      </div>
                    )}
                    
                  </div>
                  
                  {applicationDetail.candidate?.resumePath && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Resume</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-600 mb-2">
                          Resume file is available for download
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          View Resume
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={!!updateStatusDialog} onOpenChange={(open) => !open && setUpdateStatusDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Change the status of this application
            </DialogDescription>
          </DialogHeader>
          {updateStatusDialog && (
            <div className="py-4">
              <Label htmlFor="status-select">Select New Status</Label>
              <Select
                value={updateStatusDialog.status}
                onValueChange={(value) => setUpdateStatusDialog({
                  ...updateStatusDialog,
                  status: value
                })}
              >
                <SelectTrigger id="status-select" className="mt-2">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateStatusDialog(null)}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmUpdateStatus}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
