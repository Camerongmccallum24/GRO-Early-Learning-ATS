import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  History, 
  FileText,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedEmailForm } from "./enhanced-email-form";
import { SMSForm } from "./sms-form";
import { CallLogForm } from "./call-log-form";
import { CommunicationHistory } from "./communication-history";
import { TemplateManager } from "./template-manager";

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  [key: string]: any;
}

interface Application {
  id: number;
  candidateId: number;
  status: string;
  candidate?: Candidate;
  [key: string]: any;
}

interface CommunicationManagerProps {
  application: Application;
  onCommunicationSent?: () => void;
}

export function CommunicationManager({ application, onCommunicationSent }: CommunicationManagerProps) {
  const [activeTab, setActiveTab] = useState("email");
  const candidate = application?.candidate;
  
  if (!application || !candidate) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <p className="text-muted-foreground">Candidate information not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Check if the candidate has a mobile phone (for SMS/WhatsApp features)
  const hasMobilePhone = !!candidate.phone && isMobilePhone(candidate.phone);
  
  // Simple mobile phone validation
  function isMobilePhone(phone: string): boolean {
    // This is a simple check; in production, use a proper phone validation library
    // or check against your database records if a phone is marked as mobile
    return phone.length >= 10;
  }
  
  // Format phone for WhatsApp
  function formatPhoneForWhatsApp(phone: string): string {
    // Remove all non-digit characters
    return phone.replace(/\D/g, '');
  }
  
  // Open WhatsApp with the candidate's number
  function openWhatsApp() {
    if (!candidate.phone) return;
    
    const formattedPhone = formatPhoneForWhatsApp(candidate.phone);
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Candidate Communication</CardTitle>
            <CardDescription>
              Manage all communication with {candidate.name}
            </CardDescription>
          </div>
          
          {hasMobilePhone && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openWhatsApp}
              className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              WhatsApp
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full grid grid-cols-4 md:grid-cols-5">
            <TabsTrigger value="email" className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            
            <TabsTrigger value="sms" className="flex items-center" disabled={!hasMobilePhone}>
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">SMS</span>
            </TabsTrigger>
            
            <TabsTrigger value="call" className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Call Log</span>
            </TabsTrigger>
            
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            
            <TabsTrigger value="templates" className="hidden md:flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <EnhancedEmailForm 
              applicationId={application.id}
              candidateId={candidate.id}
              candidateName={candidate.name}
              candidateEmail={candidate.email}
              candidateStatus={application.status}
              onEmailSent={onCommunicationSent}
            />
          </TabsContent>
          
          <TabsContent value="sms">
            <SMSForm 
              applicationId={application.id}
              candidateId={candidate.id}
              candidateName={candidate.name}
              candidatePhone={candidate.phone || ""}
              candidateStatus={application.status}
              onSmsSent={onCommunicationSent}
            />
          </TabsContent>
          
          <TabsContent value="call">
            <CallLogForm 
              applicationId={application.id}
              candidateId={candidate.id}
              candidateName={candidate.name}
              candidatePhone={candidate.phone || ""}
              onCallLogged={onCommunicationSent}
            />
          </TabsContent>
          
          <TabsContent value="history">
            <CommunicationHistory
              candidateId={candidate.id}
              applicationId={application.id}
            />
          </TabsContent>
          
          <TabsContent value="templates">
            <TemplateManager 
              onTemplateSelected={(template) => {
                // Switch to email tab and apply the template
                setActiveTab("email");
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}