import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Sparkles } from "lucide-react";

interface EmailFormProps {
  applicationId: number;
  candidateName: string;
  candidateEmail: string;
  candidateStatus?: string;
  onEmailSent?: () => void;
}

export function EmailForm({ 
  applicationId, 
  candidateName, 
  candidateEmail,
  candidateStatus = "application_received",
  onEmailSent 
}: EmailFormProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [emailContext, setEmailContext] = useState("follow_up");
  const [additionalContext, setAdditionalContext] = useState("");
  const { toast } = useToast();

  // Generate a default message that can be edited
  const generateDefaultMessage = () => {
    return `Dear ${candidateName},\n\nThank you for your interest in our organization. We appreciate the time you've taken to apply.\n\nBest regards,\nHR Team\nGRO Early Learning`;
  };

  // Apply template to message
  const applyTemplate = (templateName: string) => {
    let newSubject = "";
    let newMessage = "";

    switch (templateName) {
      case "interview":
        newSubject = "Interview Invitation - GRO Early Learning";
        newMessage = `Dear ${candidateName},\n\nWe are pleased to inform you that we would like to invite you for an interview for the position you applied for. Our HR team will contact you shortly to schedule a convenient time.\n\nBest regards,\nHR Team\nGRO Early Learning`;
        break;
      case "additional-info":
        newSubject = "Additional Information Required - GRO Early Learning";
        newMessage = `Dear ${candidateName},\n\nThank you for your application to GRO Early Learning. We would like to request some additional information to help us better evaluate your candidacy.\n\nPlease reply to this email with the following details:\n\n1. Your availability for the next two weeks\n2. Your preferred working hours\n3. Any additional qualifications or certifications not mentioned in your resume\n\nBest regards,\nHR Team\nGRO Early Learning`;
        break;
      case "follow-up":
        newSubject = "Follow-up on Your Application - GRO Early Learning";
        newMessage = `Dear ${candidateName},\n\nWe hope this email finds you well. We wanted to follow up on your recent application to GRO Early Learning.\n\nOur team is still reviewing applications, and we appreciate your patience during this process. We expect to make a decision within the next week.\n\nBest regards,\nHR Team\nGRO Early Learning`;
        break;
      default:
        newSubject = "";
        newMessage = generateDefaultMessage();
    }

    setSubject(newSubject);
    setMessage(newMessage);
  };

  // Generate email using AI
  const generateAIEmail = async () => {
    if (isGeneratingAI) return;
    
    setIsGeneratingAI(true);
    
    try {
      const response = await apiRequest(`/api/applications/${applicationId}/send-email`, {
        method: "POST",
        body: JSON.stringify({ 
          useAI: true, 
          status: candidateStatus,
          additionalContext: `Context: ${emailContext}. ${additionalContext}`
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (data.subject) {
        setSubject(data.subject);
      }
      
      if (data.emailMessage) {
        setMessage(data.emailMessage);
      } else if (data.message && data.message.includes("sent successfully")) {
        // If actual email content wasn't returned but email was sent
        toast({
          title: "AI Email Generated",
          description: "The email has been sent successfully with AI-generated content.",
        });
        
        if (onEmailSent) {
          onEmailSent();
        }
      }
    } catch (error) {
      console.error("Error generating AI email:", error);
      toast({
        title: "Error",
        description: "Failed to generate email with AI. Please try manual templates instead.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If using AI and no content provided yet, generate it now
    if (useAI && !subject && !message) {
      return generateAIEmail();
    }
    
    // For manual submissions or AI with preview
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please provide both subject and message",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await apiRequest(`/api/applications/${applicationId}/send-email`, {
        method: "POST",
        body: JSON.stringify({ 
          subject, 
          message,
          useAI: false // Explicit flag to use provided content
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      toast({
        title: "Success",
        description: `Email sent to ${candidateEmail}`,
      });
      
      // Reset form
      setSubject("");
      setMessage("");
      
      if (onEmailSent) {
        onEmailSent();
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-medium mb-4">Send Email to Candidate</h3>
        
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500">To:</span>
            <span className="font-medium">{candidateEmail}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="useAI" 
                checked={useAI} 
                onCheckedChange={setUseAI} 
              />
              <Label htmlFor="useAI" className="cursor-pointer flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-blue-500" />
                AI-Assisted Email
              </Label>
            </div>
            
            {useAI && (
              <div className="flex-1 flex items-center gap-2">
                <Select 
                  value={emailContext} 
                  onValueChange={setEmailContext}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select context" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow_up">Application Follow-up</SelectItem>
                    <SelectItem value="interview_invitation">Interview Invitation</SelectItem>
                    <SelectItem value="information_request">Request Information</SelectItem>
                    <SelectItem value="rejection">Application Rejection</SelectItem>
                    <SelectItem value="offer">Job Offer</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input 
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Additional context (optional)"
                  className="flex-1"
                />
              </div>
            )}
          </div>
          
          {useAI && isGeneratingAI ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p>Generating personalized email with AI...</p>
              <p className="text-sm text-gray-500">This may take a few moments</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="mt-1"
                  disabled={isGeneratingAI}
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message"
                  value={message || ""}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message here"
                  className="mt-1 min-h-[200px]"
                  disabled={isGeneratingAI}
                />
              </div>
            </>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {useAI ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAIEmail}
                disabled={isGeneratingAI}
                className="gap-1"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate("interview")}
                >
                  Interview Template
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate("additional-info")}
                >
                  Request Info Template
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate("follow-up")}
                >
                  Follow-up Template
                </Button>
              </>
            )}
          </div>
          
          <Button 
            type="submit"
            disabled={isLoading || isGeneratingAI}
          >
            {isLoading ? "Sending..." : (useAI && !subject && !message) ? "Generate & Send" : "Send Email"}
          </Button>
        </div>
        
        {useAI && (
          <p className="text-xs text-gray-500 mt-4">
            <Sparkles className="h-3 w-3 inline mr-1" />
            AI-assisted emails are personalized based on the candidate's profile and the selected context.
            You can edit the generated text before sending.
          </p>
        )}
      </form>
    </Card>
  );
}