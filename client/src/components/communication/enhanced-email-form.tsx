import React, { useState, useEffect } from "react";
import { Loader2, Sparkles, X, CheckCircle, AlertCircle, PaperclipIcon } from "lucide-react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface EnhancedEmailFormProps {
  applicationId: number;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  candidateStatus?: string;
  onEmailSent?: () => void;
}

interface Attachment {
  id: string; // UUID or similar
  file: File;
  preview?: string;
  uploading: boolean;
  progress: number;
  error?: string;
}

export function EnhancedEmailForm({ 
  applicationId, 
  candidateId, 
  candidateName, 
  candidateEmail,
  candidateStatus = "applied",
  onEmailSent 
}: EnhancedEmailFormProps) {
  // Form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  // AI email generation state
  const [useAI, setUseAI] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [emailContext, setEmailContext] = useState("follow_up");
  const [additionalContext, setAdditionalContext] = useState("");
  const [tone, setTone] = useState("professional");
  
  // Templates state
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  
  // Email validation state
  const [emailValid, setEmailValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Generate a default message
  useEffect(() => {
    if (!message) {
      setMessage(generateDefaultMessage());
    }
  }, [candidateName]);
  
  // A simple email validation check
  useEffect(() => {
    if (!subject.trim()) {
      setEmailValid(false);
      setValidationMessage("Email subject is required");
    } else if (!message.trim()) {
      setEmailValid(false);
      setValidationMessage("Email message is required");
    } else {
      setEmailValid(true);
      setValidationMessage("");
    }
  }, [subject, message]);
  
  // Generate a default message that can be edited
  const generateDefaultMessage = () => {
    return `Dear ${candidateName},\n\nThank you for your interest in our organization. We appreciate the time you've taken to apply.\n\nBest regards,\nHR Team\nGRO Early Learning`;
  };
  
  // Apply template to message
  const applyTemplate = (templateId: string) => {
    // In a real app, we would fetch this from the template library
    // For now, we'll just use some hardcoded examples
    
    let newSubject = "";
    let newMessage = "";
    
    switch (templateId) {
      case "application_received":
        newSubject = "Your Application Has Been Received";
        newMessage = `Dear ${candidateName},\n\nThank you for applying to GRO Early Learning. We've received your application and our team is currently reviewing it.\n\nWe'll be in touch soon with next steps.\n\nBest regards,\nRecruiting Team\nGRO Early Learning`;
        break;
        
      case "interview_request":
        newSubject = "Interview Request for Your Application";
        newMessage = `Dear ${candidateName},\n\nWe've reviewed your application and would like to schedule an interview to discuss your qualifications further.\n\nPlease let us know your availability for next week, and we'll arrange a suitable time.\n\nWe look forward to speaking with you!\n\nBest regards,\nRecruiting Team\nGRO Early Learning`;
        break;
        
      case "interview_confirmation":
        newSubject = "Interview Confirmation";
        newMessage = `Dear ${candidateName},\n\nThis email confirms your interview scheduled for [DATE] at [TIME].\n\nThe interview will take place at [LOCATION]. Please arrive 10 minutes early and bring your identification and any requested documents.\n\nIf you need to reschedule, please contact us as soon as possible.\n\nBest regards,\nRecruiting Team\nGRO Early Learning`;
        break;
        
      case "offer_letter":
        newSubject = "Job Offer from GRO Early Learning";
        newMessage = `Dear ${candidateName},\n\nWe're pleased to offer you the position of [POSITION] at GRO Early Learning.\n\nAttached you'll find the official offer letter with details regarding compensation, benefits, and start date.\n\nPlease review the offer and respond with your acceptance by [DEADLINE].\n\nWe're excited about the possibility of you joining our team!\n\nBest regards,\nRecruiting Team\nGRO Early Learning`;
        break;
        
      case "rejection_letter":
        newSubject = "Regarding Your Application to GRO Early Learning";
        newMessage = `Dear ${candidateName},\n\nThank you for your interest in joining GRO Early Learning and for taking the time to apply.\n\nAfter careful consideration of all applications, we've decided to move forward with other candidates whose qualifications better match our current needs.\n\nWe appreciate your interest in our organization and wish you success in your job search.\n\nBest regards,\nRecruiting Team\nGRO Early Learning`;
        break;
        
      default:
        return;
    }
    
    setSubject(newSubject);
    setMessage(newMessage);
    setSelectedTemplate(templateId);
  };
  
  // Generate email using AI
  const generateAIEmail = async () => {
    if (isGeneratingAI) return;
    
    setIsGeneratingAI(true);
    
    try {
      const response = await apiRequest('/api/ai/generate-email', {
        method: "POST",
        body: JSON.stringify({ 
          candidateId,
          applicationId,
          candidateName,
          candidateEmail,
          status: candidateStatus,
          context: emailContext,
          tone: tone,
          additionalContext,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (data.subject) {
        setSubject(data.subject);
      }
      
      if (data.message) {
        setMessage(data.message);
      }
      
      toast({
        title: "AI Email Generated",
        description: "The email has been generated successfully. You can edit it before sending.",
      });
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
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const newAttachments: Attachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = Math.random().toString(36).substring(2, 15);
      
      // Generate preview for images
      let preview = undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }
      
      newAttachments.push({
        id,
        file,
        preview,
        uploading: false,
        progress: 0
      });
    }
    
    setAttachments([...attachments, ...newAttachments]);
    
    // Reset the input
    event.target.value = '';
  };
  
  // Remove an attachment
  const removeAttachment = (id: string) => {
    const updatedAttachments = attachments.filter(a => a.id !== id);
    setAttachments(updatedAttachments);
    
    // Revoke object URL for previews
    const attachment = attachments.find(a => a.id === id);
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
  };
  
  // Send the email
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailValid) {
      toast({
        title: "Validation Error",
        description: validationMessage,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First upload any attachments
      let attachmentIds: string[] = [];
      
      if (attachments.length > 0) {
        for (let attachment of attachments) {
          setAttachments(prev => 
            prev.map(a => a.id === attachment.id ? {...a, uploading: true} : a)
          );
          
          // Simulate progress updates (in a real app, this would come from the upload API)
          const progressInterval = setInterval(() => {
            setAttachments(prev => 
              prev.map(a => {
                if (a.id === attachment.id && a.progress < 90) {
                  return {...a, progress: a.progress + 10};
                }
                return a;
              })
            );
          }, 300);
          
          try {
            // Simulate file upload
            // In a real app, this would be a FormData upload to your backend
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Set to 100% when done
            setAttachments(prev => 
              prev.map(a => a.id === attachment.id ? {...a, progress: 100, uploading: false} : a)
            );
            
            attachmentIds.push(attachment.id);
          } catch (error) {
            setAttachments(prev => 
              prev.map(a => a.id === attachment.id ? {...a, uploading: false, error: "Upload failed"} : a)
            );
            throw new Error("Failed to upload attachment: " + attachment.file.name);
          } finally {
            clearInterval(progressInterval);
          }
        }
      }
      
      // Then send the email
      const response = await apiRequest(`/api/applications/${applicationId}/send-email`, {
        method: "POST",
        body: JSON.stringify({ 
          subject,
          message,
          attachmentIds
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // Log the communication
      await apiRequest("/api/communications", {
        method: "POST",
        body: JSON.stringify({
          candidateId,
          applicationId,
          type: "email",
          subject,
          message,
          direction: "outbound",
          metadata: {
            attachments: attachments.map(a => ({
              filename: a.file.name,
              size: a.file.size,
              type: a.file.type
            }))
          }
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      toast({
        title: "Email Sent Successfully",
        description: `Your email to ${candidateName} has been sent.`,
      });
      
      // Clear the form
      setSubject("");
      setMessage("");
      setAttachments([]);
      setAdditionalContext("");
      setUseAI(false);
      
      // Refresh communication logs if needed
      queryClient.invalidateQueries({ queryKey: [`/api/candidates/${candidateId}/communications`] });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}/communications`] });
      
      if (onEmailSent) {
        onEmailSent();
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Failed to Send Email",
        description: "There was an error sending your email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Subject and AI toggle */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-500">To:</span>
          <span className="font-medium">{candidateEmail}</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
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
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  type="button"
                  onClick={() => setShowTemplateManager(true)}
                >
                  Templates
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Apply an email template</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* AI Configuration */}
        {useAI && (
          <Card className="p-3 mb-4 bg-slate-50 border-blue-100">
            <CardContent className="p-0">
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <div className="flex-1">
                  <Label htmlFor="email-context" className="text-xs mb-1 block">Context</Label>
                  <Select 
                    value={emailContext} 
                    onValueChange={setEmailContext}
                  >
                    <SelectTrigger id="email-context" className="w-full">
                      <SelectValue placeholder="Select context" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Application Follow-up</SelectItem>
                      <SelectItem value="interview_invitation">Interview Invitation</SelectItem>
                      <SelectItem value="interview_confirmation">Interview Confirmation</SelectItem>
                      <SelectItem value="interview_followup">Post-Interview Followup</SelectItem>
                      <SelectItem value="offer">Job Offer</SelectItem>
                      <SelectItem value="rejection">Application Rejection</SelectItem>
                      <SelectItem value="information_request">Request Information</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <Label htmlFor="email-tone" className="text-xs mb-1 block">Tone</Label>
                  <Select 
                    value={tone} 
                    onValueChange={setTone}
                  >
                    <SelectTrigger id="email-tone" className="w-full">
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
              
              <div className="mt-3">
                <Label htmlFor="additional-context" className="text-xs mb-1 block">Additional Context (Optional)</Label>
                <Textarea 
                  id="additional-context"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Additional details for the AI to include in the email (e.g., specific meeting time, special instructions)"
                  className="resize-none"
                  rows={2}
                />
              </div>
              
              <Button 
                variant="secondary" 
                className="w-full mt-3"
                type="button"
                onClick={generateAIEmail}
                disabled={isGeneratingAI}
              >
                {isGeneratingAI && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isGeneratingAI ? "Generating Email..." : "Generate with AI"}
              </Button>
            </CardContent>
          </Card>
        )}
          
        {/* Email Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject" className={!subject.trim() ? "text-red-500" : ""}>
              Subject {!subject.trim() && "*"}
            </Label>
            <div className="relative">
              <Input 
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className={!subject.trim() ? "border-red-300 focus:border-red-500" : ""}
                disabled={isLoading || isGeneratingAI}
              />
              {!subject.trim() && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="message" className={!message.trim() ? "text-red-500" : ""}>
              Message {!message.trim() && "*"}
            </Label>
            <Textarea 
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              rows={10}
              className={!message.trim() ? "border-red-300 focus:border-red-500" : ""}
              disabled={isLoading || isGeneratingAI}
            />
          </div>
          
          {/* Attachments */}
          <div>
            <Label htmlFor="attachments">Attachments</Label>
            <div className="mt-1 border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50" onClick={() => document.getElementById('file-upload')?.click()}>
              <input
                id="file-upload"
                type="file"
                multiple
                className="sr-only"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
              <div className="space-y-2">
                <div className="flex justify-center">
                  <PaperclipIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-blue-600 hover:underline">Upload files</span> or drag and drop
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, JPG, PNG up to 10MB
                </p>
              </div>
            </div>
            
            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2 max-h-40 overflow-auto p-2 border rounded-md">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      {attachment.preview ? (
                        <img src={attachment.preview} alt="Preview" className="h-8 w-8 object-cover rounded" />
                      ) : (
                        <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
                          <PaperclipIcon className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{attachment.file.name}</p>
                        <p className="text-xs text-gray-500">{Math.round(attachment.file.size / 1024)} KB</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {attachment.uploading && (
                        <div className="w-20 mr-2">
                          <Progress value={attachment.progress} className="h-2" />
                        </div>
                      )}
                      {attachment.error && (
                        <Badge variant="destructive" className="mr-2">{attachment.error}</Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        type="button"
                        onClick={() => removeAttachment(attachment.id)}
                        className="h-8 w-8 p-0"
                        disabled={isLoading || attachment.uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Email Validation Messages */}
          {!emailValid && (
            <div className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {validationMessage}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={isLoading || isGeneratingAI || !emailValid}
            >
              Preview
            </Button>
            
            <Button 
              type="submit" 
              disabled={isLoading || isGeneratingAI || !emailValid}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isLoading ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Email Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Preview how your email will appear to the recipient
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-md p-4 mt-2 bg-white">
            <div className="flex justify-between items-start mb-4 border-b pb-2">
              <div>
                <p><strong>To:</strong> {candidateName} ({candidateEmail})</p>
                <p><strong>Subject:</strong> {subject}</p>
              </div>
              {attachments.length > 0 && (
                <div className="text-sm">
                  <p className="text-gray-500 mb-1">{attachments.length} Attachment(s)</p>
                  <ul className="text-xs text-gray-400">
                    {attachments.map((a, i) => (
                      <li key={i} className="truncate max-w-[150px]">{a.file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="whitespace-pre-line">
              {message}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close Preview
            </Button>
            <Button 
              onClick={() => {
                setShowPreview(false);
                setTimeout(() => {
                  document.querySelector<HTMLFormElement>("form")?.requestSubmit();
                }, 100);
              }}
              disabled={isLoading || !emailValid}
            >
              Send Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Template Manager Dialog - placeholder for now */}
      <Dialog open={showTemplateManager} onOpenChange={setShowTemplateManager}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Templates</DialogTitle>
            <DialogDescription>
              Select a template to apply to your email
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="all" className="mt-2">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
              <TabsTrigger value="interview">Interview</TabsTrigger>
              <TabsTrigger value="hiring">Hiring</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                <div 
                  className={`border rounded-md p-3 hover:bg-slate-50 cursor-pointer ${selectedTemplate === 'application_received' ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => applyTemplate('application_received')}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Application Received</h3>
                    <Badge variant="secondary">Application</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Initial acknowledgment of an application</p>
                </div>
                
                <div 
                  className={`border rounded-md p-3 hover:bg-slate-50 cursor-pointer ${selectedTemplate === 'interview_request' ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => applyTemplate('interview_request')}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Interview Request</h3>
                    <Badge variant="secondary">Interview</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Request to schedule an interview</p>
                </div>
                
                <div 
                  className={`border rounded-md p-3 hover:bg-slate-50 cursor-pointer ${selectedTemplate === 'interview_confirmation' ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => applyTemplate('interview_confirmation')}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Interview Confirmation</h3>
                    <Badge variant="secondary">Interview</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Confirmation of a scheduled interview</p>
                </div>
                
                <div 
                  className={`border rounded-md p-3 hover:bg-slate-50 cursor-pointer ${selectedTemplate === 'offer_letter' ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => applyTemplate('offer_letter')}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Job Offer</h3>
                    <Badge variant="secondary">Hiring</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Job offer communication</p>
                </div>
                
                <div 
                  className={`border rounded-md p-3 hover:bg-slate-50 cursor-pointer ${selectedTemplate === 'rejection_letter' ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => applyTemplate('rejection_letter')}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Rejection Letter</h3>
                    <Badge variant="secondary">Application</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Polite application rejection notice</p>
                </div>
              </div>
            </TabsContent>
            
            {/* Other template categories would have similar content */}
            <TabsContent value="application" className="mt-4">
              <div className="p-8 text-center text-gray-500">
                Application-specific templates will be shown here
              </div>
            </TabsContent>
            
            <TabsContent value="interview" className="mt-4">
              <div className="p-8 text-center text-gray-500">
                Interview-specific templates will be shown here
              </div>
            </TabsContent>
            
            <TabsContent value="hiring" className="mt-4">
              <div className="p-8 text-center text-gray-500">
                Hiring-specific templates will be shown here
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateManager(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setShowTemplateManager(false);
              }}
              disabled={!selectedTemplate}
            >
              Apply Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}