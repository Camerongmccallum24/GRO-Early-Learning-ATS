import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Send, 
  Loader2, 
  Mail, 
  FileText, 
  Sparkles, 
  X, 
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnhancedEmailFormProps {
  applicationId: number;
  candidateId: number;
  candidateName: string;
  candidateEmail?: string;
  applicationStatus?: string;
  jobTitle?: string;
  selectedTemplateId?: string | null;
  onTemplateChange?: (templateId: string | null) => void;
  getEmailTemplate?: (id: string) => any;
}

interface FormValues {
  subject: string;
  message: string;
}

export function EnhancedEmailForm({
  applicationId,
  candidateId,
  candidateName,
  candidateEmail,
  applicationStatus = "Applied",
  jobTitle = "the position",
  selectedTemplateId,
  onTemplateChange,
  getEmailTemplate
}: EnhancedEmailFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationContext, setGenerationContext] = useState("Interview Request");
  const [generationTone, setGenerationTone] = useState("professional");
  const [additionalContext, setAdditionalContext] = useState("");
  const [showAIOptions, setShowAIOptions] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form setup
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      subject: "",
      message: ""
    }
  });
  
  // Apply template when templateId changes
  React.useEffect(() => {
    if (selectedTemplateId && getEmailTemplate) {
      const template = getEmailTemplate(selectedTemplateId);
      if (template) {
        // Replace placeholders in the template
        let processedSubject = template.subject;
        let processedMessage = template.body;
        
        // Replace basic placeholders
        const replacements = {
          "{{firstName}}": candidateName.split(" ")[0],
          "{{fullName}}": candidateName,
          "{{position}}": jobTitle,
          "{{status}}": applicationStatus,
        };
        
        Object.entries(replacements).forEach(([placeholder, value]) => {
          processedSubject = processedSubject.replace(new RegExp(placeholder, "g"), value);
          processedMessage = processedMessage.replace(new RegExp(placeholder, "g"), value);
        });
        
        setValue("subject", processedSubject);
        setValue("message", processedMessage);
      }
    }
  }, [selectedTemplateId, getEmailTemplate, setValue, candidateName, jobTitle, applicationStatus]);
  
  // AI Email generation
  const generateEmail = async () => {
    if (!candidateEmail) {
      toast({
        title: "Missing Email",
        description: "Candidate email is required to generate a personalized message",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await apiRequest("/api/ai/generate-email", {
        method: "POST",
        body: JSON.stringify({
          candidateId,
          applicationId,
          candidateName,
          candidateEmail,
          status: applicationStatus,
          context: generationContext,
          tone: generationTone,
          jobTitle,
          additionalContext: additionalContext || undefined
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // Update form with generated content
      setValue("subject", response.subject);
      setValue("message", response.message);
      
      toast({
        title: "Email Generated",
        description: "AI has created a personalized email for this candidate",
      });
    } catch (error) {
      console.error("Error generating email:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the email. Please try again or write manually.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle clearing template selection
  const handleClearTemplate = () => {
    if (onTemplateChange) {
      onTemplateChange(null);
    }
    setValue("subject", "");
    setValue("message", "");
  };
  
  // Send email
  const sendEmailMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!candidateEmail) {
        throw new Error("Candidate email is required");
      }
      
      return apiRequest(`/api/applications/${applicationId}/send-email`, {
        method: "POST",
        body: JSON.stringify({
          subject: data.subject,
          message: data.message,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Email Sent Successfully",
        description: `Your message has been sent to ${candidateName}`,
      });
      
      // Clear form
      setValue("subject", "");
      setValue("message", "");
      
      // Refresh communication logs
      queryClient.invalidateQueries({ queryKey: [`/api/candidates/${candidateId}/communications`] });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}/communications`] });
    },
    onError: (error) => {
      console.error("Error sending email:", error);
      toast({
        title: "Email Not Sent",
        description: "There was an error sending your email. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Submit handler
  const onSubmit = (data: FormValues) => {
    if (!candidateEmail) {
      toast({
        title: "Cannot Send Email",
        description: "No email address is available for this candidate",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.subject.trim() || !data.message.trim()) {
      toast({
        title: "Incomplete Email",
        description: "Please provide both subject and message",
        variant: "destructive",
      });
      return;
    }
    
    sendEmailMutation.mutate(data);
  };
  
  if (!candidateEmail) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No Email Available</h3>
        <p>This candidate does not have an email address on file.</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-500">
            Sending email to: <span className="font-medium">{candidateEmail}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Template indicator */}
          {selectedTemplateId && getEmailTemplate && (
            <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              <FileText className="h-3.5 w-3.5 mr-1" />
              <span>{getEmailTemplate(selectedTemplateId)?.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1"
                onClick={handleClearTemplate}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {/* AI options toggle */}
          <Button
            type="button"
            variant={showAIOptions ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAIOptions(!showAIOptions)}
            className={showAIOptions ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Options
          </Button>
        </div>
      </div>
      
      {/* AI Generation Options */}
      {showAIOptions && (
        <Card className="mb-4 border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center text-purple-800">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Email Generator
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="context" className="text-xs text-purple-800">Email Context</Label>
                <Select
                  value={generationContext}
                  onValueChange={setGenerationContext}
                >
                  <SelectTrigger id="context">
                    <SelectValue placeholder="Select context" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Application Acknowledgement">Application Acknowledgement</SelectItem>
                    <SelectItem value="Interview Request">Interview Request</SelectItem>
                    <SelectItem value="Interview Confirmation">Interview Confirmation</SelectItem>
                    <SelectItem value="Interview Follow Up">Interview Follow Up</SelectItem>
                    <SelectItem value="Job Offer">Job Offer</SelectItem>
                    <SelectItem value="Application Status Update">Application Status Update</SelectItem>
                    <SelectItem value="Application Rejection">Application Rejection</SelectItem>
                    <SelectItem value="Request for Information">Request for Information</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tone" className="text-xs text-purple-800">Communication Tone</Label>
                <Select
                  value={generationTone}
                  onValueChange={setGenerationTone}
                >
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <Label htmlFor="additional-context" className="text-xs text-purple-800">Additional Context (Optional)</Label>
              <Textarea
                id="additional-context"
                placeholder="Add any specific details you want included in the email..."
                rows={2}
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                className="bg-white"
              />
            </div>
            
            <Button
              type="button"
              onClick={generateEmail}
              disabled={isGenerating}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Email...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Email with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="subject">Subject Line</Label>
        <Input
          id="subject"
          {...register("subject", { required: "Subject is required" })}
          placeholder="Enter email subject..."
          className={errors.subject ? "border-red-300" : ""}
        />
        {errors.subject && (
          <p className="text-sm text-red-500">{errors.subject.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          {...register("message", { required: "Message is required" })}
          placeholder="Compose your email message here..."
          rows={10}
          className={errors.message ? "border-red-300" : ""}
        />
        {errors.message && (
          <p className="text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </>
          )}
        </Button>
      </div>
    </form>
  );
}