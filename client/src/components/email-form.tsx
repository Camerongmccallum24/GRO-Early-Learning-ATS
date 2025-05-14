import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EmailFormProps {
  applicationId: number;
  candidateName: string;
  candidateEmail: string;
  onEmailSent?: () => void;
}

export function EmailForm({ 
  applicationId, 
  candidateName, 
  candidateEmail,
  onEmailSent 
}: EmailFormProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        body: JSON.stringify({ subject, message }),
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
          
          <div className="mb-4">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="mt-1"
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here"
              className="mt-1 min-h-[200px]"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex flex-wrap gap-2">
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
          </div>
          
          <Button 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Email"}
          </Button>
        </div>
      </form>
    </Card>
  );
}