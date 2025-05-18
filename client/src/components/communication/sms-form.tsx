import React, { useState, useEffect } from "react";
import { Loader2, Send, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

interface SMSFormProps {
  applicationId: number;
  candidateId: number;
  candidateName: string;
  candidatePhone: string;
  candidateStatus?: string;
  onSmsSent?: () => void;
}

export function SMSForm({
  applicationId,
  candidateId,
  candidateName,
  candidatePhone,
  candidateStatus = "applied",
  onSmsSent
}: SMSFormProps) {
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [template, setTemplate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const MAX_SMS_LENGTH = 160;
  
  // SMS validation
  useEffect(() => {
    if (!message.trim()) {
      setIsValid(false);
      setValidationMessage("Message cannot be empty");
    } else if (message.length > MAX_SMS_LENGTH) {
      setIsValid(false);
      setValidationMessage(`Message is too long (${message.length}/${MAX_SMS_LENGTH} characters)`);
    } else {
      setIsValid(true);
      setValidationMessage("");
    }
    
    setCharCount(message.length);
  }, [message]);
  
  // Apply template
  const applyTemplate = (templateType: string) => {
    let newMessage = "";
    
    switch (templateType) {
      case "interview_reminder":
        newMessage = `Hi ${candidateName.split(' ')[0]}, This is a reminder about your interview tomorrow at GRO Early Learning. Please arrive 10 minutes early. Call us if you need to reschedule.`;
        break;
        
      case "application_received":
        newMessage = `Hi ${candidateName.split(' ')[0]}, Thank you for applying to GRO Early Learning. We've received your application and will be in touch soon.`;
        break;
        
      case "documents_needed":
        newMessage = `Hi ${candidateName.split(' ')[0]}, Please submit your certifications for your GRO Early Learning application. Reply to this message if you have questions.`;
        break;
        
      case "offer_acceptance":
        newMessage = `Hi ${candidateName.split(' ')[0]}, Please confirm receipt of your offer letter from GRO Early Learning, and let us know if you accept by replying to our email.`;
        break;
        
      default:
        return;
    }
    
    setMessage(newMessage);
    setTemplate(templateType);
  };
  
  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    // Simple formatting - in a real app you'd want a proper phone formatter
    // based on the country code and number format
    if (!phone) return "";
    
    // Remove all non-digits
    const digitsOnly = phone.replace(/\D/g, "");
    
    // Format based on length (assuming US format here)
    if (digitsOnly.length === 10) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    }
    
    // If it's not 10 digits, return with minimal formatting
    return phone;
  };
  
  // Send SMS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: validationMessage,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send SMS via API
      await apiRequest("/api/communications/sms", {
        method: "POST",
        body: JSON.stringify({
          candidateId,
          applicationId,
          phone: candidatePhone,
          message
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // Log communication
      await apiRequest("/api/communications", {
        method: "POST",
        body: JSON.stringify({
          candidateId,
          applicationId,
          type: "sms",
          message,
          direction: "outbound",
          metadata: {
            phoneNumber: candidatePhone,
            template: template || null
          }
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      toast({
        title: "SMS Sent Successfully",
        description: `Your message to ${candidateName} has been sent.`,
      });
      
      // Clear form
      setMessage("");
      setTemplate("");
      
      // Refresh communication logs
      queryClient.invalidateQueries({ queryKey: [`/api/candidates/${candidateId}/communications`] });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}/communications`] });
      
      if (onSmsSent) {
        onSmsSent();
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast({
        title: "Failed to Send SMS",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-500">To:</span>
            <span className="font-medium">{formatPhoneNumber(candidatePhone)}</span>
          </div>
          <p className="text-xs text-gray-500">
            SMS messages are limited to {MAX_SMS_LENGTH} characters
          </p>
        </div>
        
        <Select 
          value={template} 
          onValueChange={applyTemplate}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Templates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interview_reminder">Interview Reminder</SelectItem>
            <SelectItem value="application_received">Application Received</SelectItem>
            <SelectItem value="documents_needed">Documents Needed</SelectItem>
            <SelectItem value="offer_acceptance">Offer Acceptance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="sms-message" className={!message.trim() ? "text-red-500" : ""}>
            Message {!message.trim() && "*"}
          </Label>
          <span className={`text-xs ${charCount > MAX_SMS_LENGTH ? "text-red-500 font-semibold" : "text-gray-500"}`}>
            {charCount}/{MAX_SMS_LENGTH}
          </span>
        </div>
        
        <div className="relative">
          <Textarea 
            id="sms-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your SMS message"
            rows={4}
            className={(!message.trim() || charCount > MAX_SMS_LENGTH) ? "border-red-300 focus:border-red-500" : ""}
            disabled={isLoading}
          />
          {(!message.trim() || charCount > MAX_SMS_LENGTH) && (
            <div className="absolute right-3 top-3">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>
        
        {/* Message Preview */}
        {message.trim() && (
          <Card className="mt-4 bg-gray-50 p-2">
            <CardContent className="p-2">
              <p className="text-sm font-medium mb-1">Preview:</p>
              <div className="bg-white p-3 rounded-md border max-w-md">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">SMS</Badge>
                  <span className="text-xs text-gray-500">To: {formatPhoneNumber(candidatePhone)}</span>
                </div>
                <p className="text-sm">{message}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Error Message */}
        {!isValid && message.trim() && (
          <div className="text-sm text-red-500 flex items-center mt-2">
            <AlertCircle className="h-4 w-4 mr-1" />
            {validationMessage}
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isLoading || !isValid}
          className="sm:w-auto w-full"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isLoading ? "Sending..." : "Send SMS"}
        </Button>
      </div>
    </form>
  );
}