import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import JobTemplates from "@/components/job-templates";
import ApplicationLinkSection from "@/components/application-link-section";

// Define the schema for job posting form
const jobPostingSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  requisitionId: z.string().optional(),
  departmentId: z.number().optional(),
  hiringManagerId: z.string().optional(),
  locationId: z.number({
    required_error: "Location is required",
    invalid_type_error: "Location must be a number",
  }),
  employmentType: z.string({
    required_error: "Employment type is required",
  }),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().default("AUD"),
  salaryRange: z.string().optional(),
  qualifications: z.string().min(1, "Qualifications are required"),
  description: z.string().min(1, "Job description is required"),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  deadline: z.date().optional().nullable(),
  status: z.string().default("draft"),
});

type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

interface JobPostingFormProps {
  id?: string;
}

export default function JobPostingForm({ id }: JobPostingFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  const [showTemplates, setShowTemplates] = useState(false);

  // Fetch locations for dropdown
  const { data: locations = [] } = useQuery({
    queryKey: ["/api/locations"],
  });

  // If editing, fetch existing job posting
  const { data: existingJob, isLoading: isJobLoading } = useQuery({
    queryKey: [`/api/job-postings/${id}`],
    enabled: isEditMode,
  });

  // Define form with resolver
  const form = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: "",
      requisitionId: "",
      departmentId: undefined,
      hiringManagerId: "",
      locationId: 0,
      employmentType: "",
      salaryMin: undefined,
      salaryMax: undefined,
      currency: "AUD",
      salaryRange: "",
      qualifications: "",
      description: "",
      requirements: "",
      benefits: "",
      deadline: null,
      status: "draft",
    },
  });

  // Populate form when existing job data is loaded
  useEffect(() => {
    if (existingJob && isEditMode) {
      // For the deadline date field, we need to convert from string to Date object if it exists
      const deadlineDate = existingJob.deadline ? new Date(existingJob.deadline) : null;

      form.reset({
        ...existingJob,
        deadline: deadlineDate,
      });
    }
  }, [existingJob, form, isEditMode]);

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (values: JobPostingFormValues) => {
      // Add the current user ID as hiring manager and creator
      const currentUserId = '123456789'; // This is the mock user ID we're using
      
      // Convert locationId from string to number if it exists
      const locationId = values.locationId ? parseInt(values.locationId as string, 10) : null;
      
      const valuesWithUser = {
        ...values,
        locationId,
        hiringManagerId: currentUserId,
        createdById: currentUserId
      };
      return apiRequest("POST", "/api/job-postings", valuesWithUser);
    },
    onSuccess: () => {
      toast({
        title: "Job posting created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/job-postings"] });
      navigate("/jobs");
    },
    onError: (error) => {
      toast({
        title: "Error creating job posting",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async (values: JobPostingFormValues) => {
      // Ensure the updated job maintains hiring manager ID
      const currentUserId = '123456789'; // This is the mock user ID we're using
      const valuesWithUser = {
        ...values,
        hiringManagerId: values.hiringManagerId || currentUserId
      };
      return apiRequest("PUT", `/api/job-postings/${id}`, valuesWithUser);
    },
    onSuccess: () => {
      toast({
        title: "Job posting updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/job-postings"] });
      queryClient.invalidateQueries({ queryKey: [`/api/job-postings/${id}`] });
      navigate("/jobs");
    },
    onError: (error) => {
      toast({
        title: "Error updating job posting",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: JobPostingFormValues) => {
    if (isEditMode) {
      updateJobMutation.mutate(values);
    } else {
      createJobMutation.mutate(values);
    }
  };

  // Handle saving as draft
  const saveDraft = () => {
    const currentValues = form.getValues();
    currentValues.status = "draft";

    if (isEditMode) {
      updateJobMutation.mutate(currentValues);
    } else {
      createJobMutation.mutate(currentValues);
    }
  };

  // Handle publish
  const publishJob = () => {
    const currentValues = form.getValues();
    currentValues.status = "active";

    if (isEditMode) {
      updateJobMutation.mutate(currentValues);
    } else {
      createJobMutation.mutate(currentValues);
    }
  };

  // Handle template selection
  const handleSelectTemplate = (template: any) => {
    form.setValue("title", template.title);
    form.setValue("qualifications", template.qualifications);
    form.setValue("employmentType", template.employmentType);
    form.setValue("description", template.description);
    form.setValue("requirements", template.requirements);
    form.setValue("benefits", template.benefits);

    toast({
      title: "Template applied",
      description: `${template.title} template has been applied. You can now customize the details.`,
    });
  };

  if (isEditMode && isJobLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 pb-16">
      {/* Page Title (only visible on desktop) */}
      <div className="bg-white border-b border-gray-200 md:flex md:items-center md:justify-between p-4 md:py-2 md:px-6 md:h-16 hidden">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium leading-6 text-[#172B4D]">
            {isEditMode ? "Edit Job Posting" : "Create New Job Posting"}
          </h1>
        </div>
        <div className="flex md:mt-0 md:ml-4 gap-2">
          {!isEditMode && <JobTemplates onSelectTemplate={handleSelectTemplate} />}
          <Button variant="outline" onClick={() => navigate("/jobs")}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex justify-between items-center mb-4 md:hidden">
        <h2 className="text-xl font-semibold text-[#172B4D]">
          {isEditMode ? "Edit Job Posting" : "Create New Job Posting"}
        </h2>
        <div className="flex gap-2">
          {!isEditMode && <JobTemplates onSelectTemplate={handleSelectTemplate} />}
          <Button variant="outline" size="sm" onClick={() => navigate("/jobs")}>
            Cancel
          </Button>
        </div>
      </div>

      <Card className="shadow overflow-hidden">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Lead Educator" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Location *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value ? String(field.value) : undefined}
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location: any) => (
                            <SelectItem key={location.id} value={String(location.id)}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Employment Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full_time">Full-time</SelectItem>
                          <SelectItem value="part_time">Part-time</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryRange"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Salary Range</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $60,000 - $75,000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualifications"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Required Qualifications *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Diploma of Early Childhood Education and Care"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Job Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of the job role"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Requirements & Responsibilities</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List the key requirements and responsibilities for this role"
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Benefits</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the benefits offered with this position"
                          className="min-h-16"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3 flex flex-col">
                      <FormLabel>Application Deadline</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          {isEditMode && (
                            <SelectItem value="closed">Closed</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isEditMode && existingJob && existingJob.status === "active" && (
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <h3 className="text-lg font-medium mb-2">Application Links</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Generate links for candidates to apply for this position. These links can be shared via email, social media, or job boards.
                  </p>
                  <ApplicationLinkSection jobId={Number(id)} />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveDraft}
                  disabled={createJobMutation.isPending || updateJobMutation.isPending}
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  onClick={publishJob}
                  disabled={createJobMutation.isPending || updateJobMutation.isPending}
                >
                  {createJobMutation.isPending || updateJobMutation.isPending
                    ? "Saving..."
                    : "Publish Job"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}