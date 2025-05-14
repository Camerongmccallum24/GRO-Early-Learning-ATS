import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JobFilters } from "@/components/job-filters";
import { Briefcase, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatEmploymentType, formatJobStatus } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function JobPostings() {
  const [filters, setFilters] = useState<{ location?: number | string; position?: string; status?: string }>({
    location: 'all',
    status: 'all'
  });
  const [jobToClose, setJobToClose] = useState<number | null>(null);
  const [jobToReopen, setJobToReopen] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch job postings with filters
  const { data: jobPostings = [], isLoading } = useQuery({
    queryKey: ["/api/job-postings", filters],
    queryFn: async ({ queryKey }) => {
      const [_, filterParams] = queryKey as [string, { location?: string | number; status?: string }];
      const params = new URLSearchParams();
      
      if (filterParams.location && filterParams.location !== 'all') params.append("locationId", String(filterParams.location));
      if (filterParams.status && filterParams.status !== 'all') params.append("status", String(filterParams.status));
      
      const url = `/api/job-postings${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, { credentials: "include" });
      
      if (!response.ok) {
        throw new Error("Failed to fetch job postings");
      }
      
      return response.json();
    },
  });

  // Close job mutation
  const closeJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return apiRequest("PUT", `/api/job-postings/${jobId}`, { status: "closed" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-postings"] });
      toast({
        title: "Job posting closed successfully",
      });
      setJobToClose(null);
    },
    onError: (error) => {
      toast({
        title: "Error closing job posting",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  // Reopen job mutation
  const reopenJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return apiRequest("PUT", `/api/job-postings/${jobId}`, { status: "active" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-postings"] });
      toast({
        title: "Job posting reopened successfully",
      });
      setJobToReopen(null);
    },
    onError: (error) => {
      toast({
        title: "Error reopening job posting",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleFilterChange = (newFilters: { location?: number | string; position?: string; status?: string }) => {
    setFilters(newFilters);
  };

  const handleCloseJob = (id: number) => {
    setJobToClose(id);
  };

  const handleReopenJob = (id: number) => {
    setJobToReopen(id);
  };

  const confirmCloseJob = () => {
    if (jobToClose) {
      closeJobMutation.mutate(jobToClose);
    }
  };

  const confirmReopenJob = () => {
    if (jobToReopen) {
      reopenJobMutation.mutate(jobToReopen);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 pb-16">
      {/* Page Title (only visible on desktop) */}
      <div className="bg-white border-b border-gray-200 md:flex md:items-center md:justify-between p-4 md:py-2 md:px-6 md:h-16 hidden">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium leading-6 text-[#172B4D]">Job Postings</h1>
        </div>
        <div className="flex md:mt-0 md:ml-4">
          <Link href="/jobs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#172B4D] md:hidden">Job Postings</h2>
        <Link href="/jobs/new" className="md:hidden">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <JobFilters onFilterChange={handleFilterChange} />

      {/* Job Postings List */}
      <Card className="shadow overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7A869A] uppercase tracking-wider">Position</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7A869A] uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7A869A] uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7A869A] uppercase tracking-wider">Applications</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7A869A] uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7A869A] uppercase tracking-wider">Published</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      Loading job postings...
                    </td>
                  </tr>
                ) : jobPostings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      No job postings found.
                      <Link href="/jobs/new">
                        <Button variant="link" className="ml-2">
                          Create one now
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  jobPostings.map((job: any) => {
                    const status = formatJobStatus(job.status);

                    return (
                      <tr key={job.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[#172B4D]">{job.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#172B4D]">{job.locationName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#172B4D]">{formatEmploymentType(job.employmentType)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#172B4D]">{job.applicationCount || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.colorClass}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7A869A]">
                          {job.status === "draft" ? "-" : formatDate(job.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {job.status === "closed" ? (
                            <>
                              <Link href={`/jobs/edit/${job.id}`} className="text-primary hover:text-blue-700 mr-3">
                                View
                              </Link>
                              <button
                                onClick={() => handleReopenJob(job.id)}
                                className="text-secondary hover:text-green-700"
                              >
                                Reopen
                              </button>
                            </>
                          ) : job.status === "draft" ? (
                            <>
                              <Link href={`/jobs/edit/${job.id}`} className="text-primary hover:text-blue-700 mr-3">
                                Edit
                              </Link>
                              <button
                                onClick={() => {
                                  // For drafts, we'd normally publish instead of close
                                  handleReopenJob(job.id);
                                }}
                                className="text-secondary hover:text-green-700"
                              >
                                Publish
                              </button>
                            </>
                          ) : (
                            <>
                              <Link href={`/jobs/edit/${job.id}`} className="text-primary hover:text-blue-700 mr-3">
                                Edit
                              </Link>
                              <button
                                onClick={() => handleCloseJob(job.id)}
                                className="text-[#FF5630] hover:text-red-700"
                              >
                                Close
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Close Job Dialog */}
      <Dialog open={jobToClose !== null} onOpenChange={(open) => !open && setJobToClose(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Job Posting</DialogTitle>
            <DialogDescription>
              Are you sure you want to close this job posting? This will remove it from the active job listings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setJobToClose(null)}
              disabled={closeJobMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCloseJob}
              disabled={closeJobMutation.isPending}
            >
              {closeJobMutation.isPending ? "Closing..." : "Yes, Close Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reopen Job Dialog */}
      <Dialog open={jobToReopen !== null} onOpenChange={(open) => !open && setJobToReopen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reopen Job Posting</DialogTitle>
            <DialogDescription>
              Are you sure you want to reopen this job posting? This will make it visible to candidates again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setJobToReopen(null)}
              disabled={reopenJobMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-secondary hover:bg-secondary/90"
              onClick={confirmReopenJob}
              disabled={reopenJobMutation.isPending}
            >
              {reopenJobMutation.isPending ? "Reopening..." : "Yes, Reopen Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
