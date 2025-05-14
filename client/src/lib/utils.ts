import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to human-readable format
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format job employment type from snake_case to readable format
export function formatEmploymentType(type: string): string {
  if (!type) return '';
  
  const typeMap: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    casual: 'Casual',
    contract: 'Contract'
  };
  
  return typeMap[type] || type;
}

// Format application status from snake_case to readable format
export function formatApplicationStatus(status: string): string {
  if (!status) return '';
  
  const statusMap: Record<string, string> = {
    applied: 'Applied',
    in_review: 'In Review',
    interview: 'Interview',
    offered: 'Offered',
    hired: 'Hired',
    rejected: 'Rejected'
  };
  
  return statusMap[status] || status;
}

// Get CSS class for application status badge
export function getStatusClass(status: string): string {
  if (!status) return '';
  
  const statusClasses: Record<string, string> = {
    applied: 'status-applied',
    in_review: 'status-in-review',
    interview: 'status-interview',
    offered: 'status-offered',
    hired: 'status-hired',
    rejected: 'status-rejected'
  };
  
  return statusClasses[status] || '';
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Format job status from snake_case to readable format with color class
export function formatJobStatus(status: string): { text: string; colorClass: string } {
  if (!status) return { text: '', colorClass: '' };
  
  const statusMap: Record<string, { text: string; colorClass: string }> = {
    draft: { text: 'Draft', colorClass: 'bg-gray-100 text-gray-800' },
    active: { text: 'Active', colorClass: 'bg-green-100 text-green-800' },
    closed: { text: 'Closed', colorClass: 'bg-red-100 text-red-800' },
  };
  
  return statusMap[status] || { text: status, colorClass: '' };
}
