import React, { useState } from "react";
import { Loader2, Send, MessageSquare, WhatsappLogo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { FaWhatsapp } from "react-icons/fa";

interface SMSFormProps {
  applicationId: number;
  candidateId: number;
  candidateName: string;
  candidatePhone: string;
}

export function SMSForm({
  applicationId,
  candidateId,
  candidateName,
  candidatePhone
}: SMSFormProps) {
  const [message, setMessage] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [messageCount, setMessageCount] = useState(1);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    
    // Remove all non-digits
    const digitsOnly = phone.replace(/\D/g, "");
    
    // Format based on length (assuming US format here)
    if (digitsOnly.length === 10) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    }
    
    return phone;
  };
  
  // Calculate character and message counts
  const updateCounts = (text: string) => {
    const chars = text.length;
    setCharacterCount(chars);
    
    // SMS typically splits at 160 characters for single-byte characters
    setMessageCount(Math.ceil(chars / 160) || 1);
  };
  
  // Handle message change
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMessage(text);
    updateCounts(text);
  };
  
  // Send SMS mutation
  const sendSMSMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/communications/sms", {
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
    },
    onSuccess: () => {
      toast({
        title: "SMS Sent Successfully",
        description: `Your message has been sent to ${candidateName}`,
      });
      
      // Clear form
      setMessage("");
      setCharacterCount(0);
      setMessageCount(1);
      
      // Refresh communication logs
      queryClient.invalidateQueries({ queryKey: [`/api/candidates/${candidateId}/communications`] });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}/communications`] });
    },
    onError: (error) => {
      console.error("Error sending SMS:", error);
      toast({
        title: "SMS Not Sent",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Open WhatsApp
  const openWhatsApp = () => {
    // Format phone for WhatsApp (remove all non-digits)
    const whatsappNumber = candidatePhone.replace(/\D/g, "");
    
    // Create WhatsApp URL with pre-filled message
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Open in new tab
    window.open(whatsappUrl, "_blank");
    
    // Log the communication if there's a message
    if (message.trim()) {
      // Create a log entry for the WhatsApp message
      apiRequest("/api/communications", {
        method: "POST",
        body: JSON.stringify({
          candidateId,
          applicationId,
          type: "sms",
          message,
          direction: "outbound",
          metadata: {
            channel: "whatsapp",
            phoneNumber: candidatePhone
          }
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(() => {
          // Refresh communication logs
          queryClient.invalidateQueries({ queryKey: [`/api/candidates/${candidateId}/communications`] });
          queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}/communications`] });
          
          // Clear form
          setMessage("");
          setCharacterCount(0);
          setMessageCount(1);
        })
        .catch(error => {
          console.error("Error logging WhatsApp message:", error);
        });
    }
  };
  
  // Handle sending SMS
  const handleSendSMS = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message before sending",
        variant: "destructive",
      });
      return;
    }
    
    sendSMSMutation.mutate();
  };
  
  return (
    <form onSubmit={handleSendSMS} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-500">Recipient:</span>
            <span className="font-medium">{candidateName}</span>
            <span className="text-sm text-gray-500">{formatPhoneNumber(candidatePhone)}</span>
          </div>
          <p className="text-xs text-gray-500">
            Messages will be sent directly to the candidate's mobile phone
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="sms-message" className="text-sm font-medium">
            Message
          </label>
          <div className="text-xs text-gray-500">
            {characterCount} characters ({messageCount} message{messageCount > 1 ? "s" : ""})
          </div>
        </div>
        
        <Textarea
          id="sms-message"
          value={message}
          onChange={handleMessageChange}
          placeholder="Type your SMS message here..."
          rows={4}
          className={characterCount > 480 ? "border-amber-300" : ""}
        />
        
        {characterCount > 480 && (
          <p className="text-xs text-amber-600">
            This message will be sent as multiple SMS messages ({messageCount})
          </p>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={openWhatsApp}
          className="text-green-600 border-green-300 hover:bg-green-50"
        >
          <FaWhatsapp className="h-4 w-4 mr-2 text-green-600" />
          Send via WhatsApp
        </Button>
        
        <Button 
          type="submit" 
          disabled={sendSMSMutation.isPending || !message.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {sendSMSMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send SMS
            </>
          )}
        </Button>
      </div>
    </form>
  );
}