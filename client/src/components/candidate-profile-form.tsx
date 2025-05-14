import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { submitCandidateWithResume, previewPdf } from "@/lib/resume-parser";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, Upload } from "lucide-react";

const candidateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  consentPolicyVersion: z.string().optional(),
  ccpaOptOut: z.boolean().optional(),
});

type CandidateFormValues = z.infer<typeof candidateFormSchema>;

interface CandidateProfileFormProps {
  jobId?: number;
  onSuccess?: (candidateId: number) => void;
}

export function CandidateProfileForm({ jobId, onSuccess }: CandidateProfileFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      skills: "",
      experience: "",
      education: "",
      consentPolicyVersion: "1.0",
      ccpaOptOut: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (values: CandidateFormValues) => {
      return submitCandidateWithResume(values, resumeFile);
    },
    onSuccess: (data) => {
      toast({
        title: "Profile submitted successfully",
        description: "Thank you for your application",
      });
      form.reset();
      setResumeFile(null);
      setPreviewUrl(null);
      
      if (onSuccess && data.id) {
        onSuccess(data.id);
      }
    },
    onError: (error) => {
      toast({
        title: "Error submitting profile",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setResumeFile(file);
      
      // Clear any existing preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      // If it's a PDF, create a preview
      if (file.type.includes('pdf')) {
        try {
          const url = await previewPdf(file);
          setPreviewUrl(url);
        } catch (error) {
          console.error("Error previewing PDF:", error);
        }
      }
    }
  };

  const onSubmit = (values: CandidateFormValues) => {
    submitMutation.mutate(values);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Candidate Profile</CardTitle>
        <CardDescription>
          Please fill out your information for this application. Fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="(04) 1234 5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <FormLabel htmlFor="resume">Resume (PDF, DOC, DOCX) *</FormLabel>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <div className="flex items-center justify-center">
                    <label
                      htmlFor="resume-upload"
                      className="flex flex-col items-center space-y-2 cursor-pointer"
                    >
                      <CloudUpload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {resumeFile ? resumeFile.name : "Click to upload your resume"}
                      </span>
                      <span className="text-xs text-gray-400">
                        Max file size: 5MB
                      </span>
                      <input
                        id="resume-upload"
                        name="resume"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Preview:</p>
                  <div className="h-36 border rounded overflow-hidden">
                    <iframe
                      src={previewUrl}
                      title="Resume Preview"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List your educational background, including any Early Childhood qualifications"
                      className="h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your work experience, especially in childcare or education"
                      className="h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List relevant skills for this position"
                      className="h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ccpaOptOut"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Opt out of data sharing (CCPA)
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Check this box if you do not want your information shared with third parties.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="text-sm text-muted-foreground">
              <p>
                By submitting this form, you consent to our{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>{" "}
                and agree to the processing of your personal data.
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
