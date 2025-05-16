import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, FileText, Link } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface JobPosting {
  id: number;
  title: string;
  requisitionId: string;
  status: string;
  category?: string;
  location?: string;
  employmentType?: string;
  createdAt: string;
}

export function JobPostingsTable({ 
  jobPostings, 
  onView, 
  onEdit, 
  onDelete,
  onCreateLink
}: { 
  jobPostings: JobPosting[]; 
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onCreateLink?: (id: number) => void;
}) {
  return (
    <div className="job-postings-container w-full overflow-hidden">
      <table className="w-full responsive-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Requisition ID</th>
            <th>Status</th>
            <th>Category</th>
            <th>Location</th>
            <th>Type</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobPostings.map((job) => (
            <tr key={job.id}>
              <td data-label="Title">{job.title}</td>
              <td data-label="Requisition ID">{job.requisitionId}</td>
              <td data-label="Status">
                <Badge 
                  variant={job.status === 'active' ? 'success' : 'secondary'}
                  className={job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                >
                  {job.status}
                </Badge>
              </td>
              <td data-label="Category">{job.category || 'N/A'}</td>
              <td data-label="Location">{job.location || 'N/A'}</td>
              <td data-label="Type">{job.employmentType || 'N/A'}</td>
              <td data-label="Created">{formatDate(job.createdAt)}</td>
              <td data-label="Actions" className="action-cell">
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(job.id)}
                    aria-label={`View ${job.title}`}
                    className="flex-nowrap"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    <span className="sm:inline-block">View</span>
                  </Button>
                  {onCreateLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCreateLink(job.id)}
                      aria-label={`Create link for ${job.title}`}
                      className="flex-nowrap"
                    >
                      <Link className="h-4 w-4 mr-1" />
                      <span className="sm:inline-block">Link</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(job.id)}
                    aria-label={`Edit ${job.title}`}
                    className="flex-nowrap"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    <span className="sm:inline-block">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(job.id)}
                    aria-label={`Delete ${job.title}`}
                    className="flex-nowrap text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="sm:inline-block">Delete</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}