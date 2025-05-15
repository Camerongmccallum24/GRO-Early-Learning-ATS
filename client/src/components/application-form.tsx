import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schema definition
const applicationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(8, { message: "Please enter a valid phone number." }),
  experience: z.string().optional(),
  education: z.string().optional(),
  coverLetter: z.string().optional(),
  dataConsent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the data processing terms.",
  }),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  jobId: number;
  jobTitle?: string;
  onApplicationSubmitted: () => void;
}

export function ApplicationForm({ jobId, jobTitle, onApplicationSubmitted }: ApplicationFormProps) {
  const { toast } = useToast();
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const form = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      experience: "",
      education: "",
      coverLetter: "",
      dataConsent: false,
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (values: ApplicationValues) => {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("jobPostingId", jobId.toString());
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      
      if (values.experience) formData.append("experience", values.experience);
      if (values.education) formData.append("education", values.education);
      if (values.coverLetter) formData.append("coverLetter", values.coverLetter);
      if (resumeFile) formData.append("resume", resumeFile);
      
      // Track application source
      formData.append("source", "application_link");

      // Send the application
      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit application");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted successfully",
        description: "Thank you for your application!",
      });
      onApplicationSubmitted();
    },
    onError: (error) => {
      toast({
        title: "Error submitting application",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setResumeFile(files[0]);
    }
  };

  const onSubmit = (values: ApplicationValues) => {
    applicationMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input placeholder="john.smith@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input placeholder="0412 345 678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div>
            <FormLabel htmlFor="resume">Resume / CV (PDF, DOC, DOCX)</FormLabel>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <FormDescription>
              Upload your resume or CV to help us understand your background.
            </FormDescription>
          </div>
        </div>

        <FormField
          control={form.control}
          name="education"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Education Background</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share details about your education, degrees, certificates, etc."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include relevant qualifications for this position.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Experience</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your previous work experience, particularly in early childhood education or related fields."
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
          name="coverLetter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Letter or Additional Information</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us why you're interested in this position and how your skills align with our requirements."
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
          name="dataConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Data Processing Consent *</FormLabel>
                <FormDescription>
                  I understand and consent to GRO Early Learning storing and processing my personal information for
                  recruitment purposes. I acknowledge that I can request access to my data or its deletion at any time.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={applicationMutation.isPending}
        >
          {applicationMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            `Submit Application${jobTitle ? ` for ${jobTitle}` : ''}`
          )}
        </Button>
      </form>
    </Form>
  );
}