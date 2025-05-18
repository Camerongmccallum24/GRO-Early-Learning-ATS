import React, { useState } from "react";
import { Loader2, Phone, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface CallLogFormProps {
  applicationId: number;
  candidateId: number;
  candidateName: string;
  candidatePhone: string;
  onCallLogged?: () => void;
}

export function CallLogForm({
  applicationId,
  candidateId,
  candidateName,
  candidatePhone,
  onCallLogged
}: CallLogFormProps) {
  const [callType, setCallType] = useState("outbound");
  const [callDuration, setCallDuration] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [callOutcome, setCallOutcome] = useState("completed");
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  // Enable click-to-call functionality
  const initiateCall = () => {
    if (!candidatePhone) return;
    
    // For mobile devices
    window.location.href = `tel:${candidatePhone}`;
    
    // After a short delay, focus back on the app
    setTimeout(() => {
      window.focus();
      
      // Pre-populate the call log
      setCallType("outbound");
      setCallOutcome("initiated");
      setCallNotes(`Call initiated to ${candidateName} on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`);
    }, 500);
  };
  
  // Submit call log
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!callNotes.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide call notes before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Log the call in the communication history
      await apiRequest("/api/communications", {
        method: "POST",
        body: JSON.stringify({
          candidateId,
          applicationId,
          type: "phone",
          subject: `${callType === "outbound" ? "Outgoing" : "Incoming"} call - ${callOutcome}`,
          message: callNotes,
          direction: callType,
          metadata: {
            phoneNumber: candidatePhone,
            duration: callDuration || "Not recorded",
            outcome: callOutcome,
            timestamp: new Date().toISOString()
          }
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      toast({
        title: "Call Logged Successfully",
        description: "Your call with the candidate has been recorded",
      });
      
      // Clear form
      setCallDuration("");
      setCallNotes("");
      
      // Refresh communication logs
      queryClient.invalidateQueries({ queryKey: [`/api/candidates/${candidateId}/communications`] });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}/communications`] });
      
      if (onCallLogged) {
        onCallLogged();
      }
    } catch (error) {
      console.error("Error logging call:", error);
      toast({
        title: "Failed to Log Call",
        description: "There was an error saving the call record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-500">Contact:</span>
            <span className="font-medium">{candidateName}</span>
            {candidatePhone && (
              <span className="text-sm text-gray-500">{formatPhoneNumber(candidatePhone)}</span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Record details of phone interactions with this candidate
          </p>
        </div>
        
        {candidatePhone && (
          <Button 
            type="button" 
            variant="secondary"
            onClick={initiateCall}
            className="text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call Now
          </Button>
        )}
      </div>
      
      {/* Call Type */}
      <div>
        <Label htmlFor="call-type" className="mb-2 block">Call Direction</Label>
        <RadioGroup 
          id="call-type" 
          value={callType} 
          onValueChange={setCallType}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="outbound" id="outbound" />
            <Label htmlFor="outbound">Outbound Call</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inbound" id="inbound" />
            <Label htmlFor="inbound">Inbound Call</Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Call Outcome */}
      <div>
        <Label htmlFor="call-outcome" className="mb-2 block">Call Outcome</Label>
        <RadioGroup 
          id="call-outcome" 
          value={callOutcome} 
          onValueChange={setCallOutcome}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="completed" id="completed" />
            <Label htmlFor="completed">Completed</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="missed" id="missed" />
            <Label htmlFor="missed">Missed/No Answer</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="voicemail" id="voicemail" />
            <Label htmlFor="voicemail">Left Voicemail</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="scheduled-callback" id="scheduled-callback" />
            <Label htmlFor="scheduled-callback">Scheduled Callback</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="initiated" id="initiated" />
            <Label htmlFor="initiated">Call Initiated</Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Call Duration */}
      <div>
        <Label htmlFor="call-duration" className="mb-2 block">Call Duration (Optional)</Label>
        <div className="relative max-w-xs">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            id="call-duration"
            value={callDuration}
            onChange={(e) => setCallDuration(e.target.value)}
            placeholder="e.g. 15 minutes"
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Call Notes */}
      <div>
        <Label htmlFor="call-notes" className="mb-2 block">Call Notes</Label>
        <Textarea 
          id="call-notes"
          value={callNotes}
          onChange={(e) => setCallNotes(e.target.value)}
          placeholder="Enter details of your conversation, topics discussed, and any action items"
          rows={4}
          required
        />
      </div>
      
      {/* Call Record Preview */}
      {callNotes.trim() && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-sm">Call Record Preview</h3>
              <Badge variant={callType === "outbound" ? "default" : "outline"}>
                {callType === "outbound" ? "Outgoing" : "Incoming"}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</span>
              </div>
              
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium">{candidateName} • {formatPhoneNumber(candidatePhone)}</div>
                  <div className="text-gray-600">{callOutcome} {callDuration && `• ${callDuration}`}</div>
                </div>
              </div>
              
              <div className="bg-white p-2 rounded border mt-2">
                <p className="whitespace-pre-line">{callNotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isLoading || !callNotes.trim()}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isLoading ? "Logging..." : "Log Call"}
        </Button>
      </div>
    </form>
  );
}