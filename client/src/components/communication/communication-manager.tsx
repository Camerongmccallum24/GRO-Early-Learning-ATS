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
  Book
} from "lucide-react";
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Communication Manager</CardTitle>
        <CardDescription>
          Connect with {candidateName} through multiple channels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="email" className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <span>Email</span>
            </TabsTrigger>
            <TabsTrigger 
              value="sms" 
              className="flex items-center"
              disabled={!candidatePhone}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>SMS</span>
            </TabsTrigger>
            <TabsTrigger 
              value="call" 
              className="flex items-center"
              disabled={!candidatePhone}
            >
              <Phone className="h-4 w-4 mr-2" />
              <span>Call Log</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              <span>History</span>
            </TabsTrigger>
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
            <div className="flex items-center mb-4">
              <Book className="h-5 w-5 mr-2 text-muted-foreground" />
              <h3 className="text-lg font-medium">Email Templates</h3>
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