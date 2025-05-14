import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CandidateProfileForm } from "./candidate-profile-form";

// Define the schema for job application
const applicationSchema = z.object({
  jobPostingId: z.number(),
  candidateId: z.number(),
  notes: z.string().optional(),
  source: z.string().default("direct"),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  jobPostingId: number;
  onSuccess?: () => void;
}

export function ApplicationForm({ jobPostingId, onSuccess }: ApplicationFormProps) {
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch job posting details
  const { data: jobPosting, isLoading: isJobLoading } = useQuery({
    queryKey: [`/api/job-postings/${jobPostingId}`],
  });

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      jobPostingId,
      candidateId: 0,
      notes: "",
      source: "direct",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (values: ApplicationFormValues) => {
      return apiRequest('POST', '/api/applications', values);
    },
    onSuccess: () => {
      toast({
        title: "Application submitted successfully",
        description: "Thank you for your application",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error submitting application",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ApplicationFormValues) => {
    submitMutation.mutate(values);
  };

  const handleCandidateSuccess = (id: number) => {
    setCandidateId(id);
    form.setValue("candidateId", id);
  };

  if (isJobLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-pulse w-full">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!candidateId) {
    return <CandidateProfileForm jobId={jobPostingId} onSuccess={handleCandidateSuccess} />;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Apply for {jobPosting?.title}</CardTitle>
        <CardDescription>
          Complete your application for this position at {jobPosting?.locationId} location.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional information you'd like us to know about your application"
                      className="h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm text-muted-foreground">
              <p>
                By submitting this application, you confirm that all information provided is accurate and complete.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
