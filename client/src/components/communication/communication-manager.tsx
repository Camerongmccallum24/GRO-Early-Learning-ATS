import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  History, 
  FileText, 
  Book,
  HelpCircle,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { EnhancedEmailForm } from "./enhanced-email-form";
import { SMSForm } from "./sms-form";
import { CallLogForm } from "./call-log-form";
import { CommunicationHistory } from "./communication-history";
import { TemplateManager } from "./template-manager";

interface CommunicationManagerProps {
  applicationId: number;
  candidateId: number;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  applicationStatus?: string;
  jobTitle?: string;
}

export function CommunicationManager({
  applicationId,
  candidateId,
  candidateName,
  candidateEmail,
  candidatePhone,
  applicationStatus,
  jobTitle
}: CommunicationManagerProps) {
  const [activeTab, setActiveTab] = useState("email");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  // Get templates
  const { data: templates = [] } = useQuery({
    queryKey: ["/api/email-templates"],
  });
  
  // Function to get email template
  const getEmailTemplate = (id: string) => {
    return templates.find((template: any) => template.id === id);
  };
  
  // Handle template selection
  const handleTemplateSelected = (template: any) => {
    if (activeTab === "email") {
      setSelectedTemplateId(template.id);
    }
  };
  
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Communication Manager</CardTitle>
            <CardDescription>
              Connect with {candidateName} through multiple channels
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Communication Manager</h3>
                  <p className="text-sm">Use this tool to interact with candidates through multiple channels:</p>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    <li>Send personalized emails with AI assistance</li>
                    <li>Send SMS messages or connect via WhatsApp</li>
                    <li>Log phone calls and conversation details</li>
                    <li>View communication history with the candidate</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4 w-full overflow-x-auto">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="email" className="flex items-center text-xs sm:text-sm">
                    <Mail className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Email</span>
                    <span className="xs:hidden">📧</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-3 max-w-[250px]">
                  <p className="text-sm">Send personalized emails with optional AI assistance. Use email templates for common communications.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="sms" 
                    className="flex items-center text-xs sm:text-sm"
                    disabled={!candidatePhone}
                  >
                    <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">SMS</span>
                    <span className="xs:hidden">💬</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-3 max-w-[250px]">
                  {candidatePhone ? 
                    <p className="text-sm">Send SMS messages or connect via WhatsApp for quick communication with the candidate.</p> :
                    <p className="text-sm">SMS messaging unavailable - no phone number on record for this candidate.</p>
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="call" 
                    className="flex items-center text-xs sm:text-sm"
                    disabled={!candidatePhone}
                  >
                    <Phone className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Call Log</span>
                    <span className="xs:hidden">📞</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-3 max-w-[250px]">
                  {candidatePhone ? 
                    <p className="text-sm">Log details of phone conversations with candidates to maintain complete communication records.</p> :
                    <p className="text-sm">Call logging unavailable - no phone number on record for this candidate.</p>
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="history" className="flex items-center text-xs sm:text-sm">
                    <History className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">History</span>
                    <span className="xs:hidden">📋</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-3 max-w-[250px]">
                  <p className="text-sm">View a timeline of all communication with this candidate across all channels.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <EnhancedEmailForm
              applicationId={applicationId}
              candidateId={candidateId}
              candidateName={candidateName}
              candidateEmail={candidateEmail}
              applicationStatus={applicationStatus}
              jobTitle={jobTitle}
              selectedTemplateId={selectedTemplateId}
              onTemplateChange={setSelectedTemplateId}
              getEmailTemplate={getEmailTemplate}
            />
          </TabsContent>
          
          <TabsContent value="sms" className="space-y-4">
            {candidatePhone ? (
              <SMSForm
                applicationId={applicationId}
                candidateId={candidateId}
                candidateName={candidateName}
                candidatePhone={candidatePhone}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No phone number available for this candidate.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="call" className="space-y-4">
            {candidatePhone ? (
              <CallLogForm
                applicationId={applicationId}
                candidateId={candidateId}
                candidateName={candidateName}
                candidatePhone={candidatePhone}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No phone number available for this candidate.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <CommunicationHistory 
              candidateId={candidateId}
              applicationId={applicationId}
            />
          </TabsContent>
        </Tabs>
        
        {/* Template library - only shown for email tab */}
        {activeTab === "email" && (
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Book className="h-5 w-5 mr-2 text-muted-foreground" />
                <h3 className="text-lg font-medium">Email Templates</h3>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      <Info className="h-4 w-4 text-blue-500" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="p-3 max-w-[300px]">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Email Templates</h4>
                      <p className="text-xs">
                        Use these pre-written templates for common communications. Click on a template to 
                        automatically fill the email form with professionally written content.
                      </p>
                      <p className="text-xs mt-1">
                        Templates automatically replace placeholders with candidate information.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <TemplateManager 
              onTemplateSelected={handleTemplateSelected}
              compact={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}