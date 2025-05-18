import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Pencil, 
  Trash, 
  Search, 
  Save, 
  Tag, 
  File, 
  Share2,
  Loader2
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  subject: string;
  body: string;
  category: string;
  isShared: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplateManagerProps {
  onTemplateSelected?: (template: EmailTemplate) => void;
  showFilters?: boolean;
  compact?: boolean;
}

export function TemplateManager({ 
  onTemplateSelected,
  showFilters = true,
  compact = false
}: TemplateManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  
  // Form state for creating/editing templates
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [templateCategory, setTemplateCategory] = useState("general");
  const [isTemplateShared, setIsTemplateShared] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch templates (would connect to a real API in production)
  const { data: templates = [], isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
    queryFn: async () => {
      // This is a mock implementation
      // In a real app, this would fetch from your API
      return mockTemplates;
    }
  });
  
  // Template categories
  const categories = [
    { value: "general", label: "General" },
    { value: "application", label: "Application" },
    { value: "interview", label: "Interview" },
    { value: "offer", label: "Offer" },
    { value: "onboarding", label: "Onboarding" },
    { value: "rejection", label: "Rejection" },
    { value: "reference", label: "Reference Check" },
  ];
  
  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    // Category filter
    if (selectedCategory !== "all" && template.category !== selectedCategory) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        template.name.toLowerCase().includes(searchLower) ||
        template.subject.toLowerCase().includes(searchLower) ||
        template.body.toLowerCase().includes(searchLower) ||
        (template.description && template.description.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });
  
  // Handle template selection
  const handleSelectTemplate = (template: EmailTemplate) => {
    if (onTemplateSelected) {
      onTemplateSelected(template);
    }
  };
  
  // Open edit dialog
  const handleEditTemplate = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description || "");
    setTemplateSubject(template.subject);
    setTemplateBody(template.body);
    setTemplateCategory(template.category);
    setIsTemplateShared(template.isShared);
    setIsEditing(true);
  };
  
  // Open create dialog
  const handleCreateTemplate = () => {
    setCurrentTemplate(null);
    setTemplateName("");
    setTemplateDescription("");
    setTemplateSubject("");
    setTemplateBody("");
    setTemplateCategory("general");
    setIsTemplateShared(false);
    setIsCreating(true);
  };
  
  // Validate template form
  const isTemplateFormValid = () => {
    return (
      templateName.trim() !== "" && 
      templateSubject.trim() !== "" && 
      templateBody.trim() !== ""
    );
  };
  
  // Save template (create or update)
  const handleSaveTemplate = async () => {
    if (!isTemplateFormValid()) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Create new template object
    const templateData = {
      id: currentTemplate?.id || `template-${Date.now()}`,
      name: templateName,
      description: templateDescription,
      subject: templateSubject,
      body: templateBody,
      category: templateCategory,
      isShared: isTemplateShared,
      createdBy: "current-user", // In a real app, this would be the current user's ID
      createdAt: currentTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      // In a real app, this would be an API call to save the template
      toast({
        title: isEditing ? "Template Updated" : "Template Created",
        description: `Template "${templateName}" has been ${isEditing ? "updated" : "created"} successfully`,
      });
      
      // Close dialog
      setIsCreating(false);
      setIsEditing(false);
      
      // Refresh templates
      // queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} template`,
        variant: "destructive",
      });
    }
  };
  
  // Render template list item
  const renderTemplateItem = (template: EmailTemplate) => (
    <div
      key={template.id}
      className="border rounded-md p-3 hover:bg-slate-50 cursor-pointer transition-colors"
      onClick={() => handleSelectTemplate(template)}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-medium">{template.name}</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{categories.find(c => c.value === template.category)?.label || template.category}</Badge>
          {template.isShared && (
            <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">Shared</Badge>
          )}
        </div>
      </div>
      
      {template.description && (
        <p className="text-sm text-gray-500 mb-2">{template.description}</p>
      )}
      
      <div className="text-sm text-gray-700">
        <div className="font-medium">Subject: {template.subject}</div>
        <div className="line-clamp-2 mt-1 text-gray-500">{template.body}</div>
      </div>
      
      <div className="flex justify-end mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleEditTemplate(template);
          }}
        >
          <Pencil className="h-4 w-4 mr-1" /> Edit
        </Button>
      </div>
    </div>
  );
  
  // Compact view for just template selection
  if (compact) {
    return (
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No templates found
          </div>
        ) : (
          filteredTemplates.map(renderTemplateItem)
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleCreateTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>
      )}
      
      {/* Templates List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm 
              ? "No templates match your search" 
              : selectedCategory !== "all" 
                ? `No templates in the "${categories.find(c => c.value === selectedCategory)?.label}" category` 
                : "No templates found"}
            <div className="mt-4">
              <Button onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Create a template
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map(renderTemplateItem)}
          </div>
        )}
      </div>
      
      {/* Create/Edit Template Dialog */}
      <Dialog 
        open={isCreating || isEditing} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setIsEditing(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Email Template" : "Create New Email Template"}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update this template for future use" 
                : "Create a reusable template for common email communications"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Interview Confirmation"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-category">Category *</Label>
                <Select
                  value={templateCategory}
                  onValueChange={setTemplateCategory}
                >
                  <SelectTrigger id="template-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-description">Description (Optional)</Label>
              <Input
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Brief description of when to use this template"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject Line *</Label>
              <Input
                id="template-subject"
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
                placeholder="e.g., Your Interview with GRO Early Learning"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="template-body">Email Body *</Label>
                <div className="text-xs text-gray-500">
                  Use placeholders like {{firstName}}, {{position}}, etc. for personalization
                </div>
              </div>
              <Textarea
                id="template-body"
                value={templateBody}
                onChange={(e) => setTemplateBody(e.target.value)}
                placeholder="Dear {{firstName}},\n\nThank you for your application to the {{position}} role..."
                rows={8}
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="template-shared"
                checked={isTemplateShared}
                onChange={(e) => setIsTemplateShared(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="template-shared" className="cursor-pointer">
                Share with team members
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTemplate}
              disabled={!isTemplateFormValid()}
            >
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update Template" : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Mock templates data for demonstration
const mockTemplates: EmailTemplate[] = [
  {
    id: "template-1",
    name: "Application Received",
    description: "Initial acknowledgment of an application",
    subject: "We've Received Your Application to GRO Early Learning",
    body: "Dear {{firstName}},\n\nThank you for applying to the {{position}} position at GRO Early Learning. We've received your application and our team is currently reviewing it.\n\nWe appreciate your interest in joining our team and will be in touch with next steps soon.\n\nBest regards,\nRecruiting Team\nGRO Early Learning",
    category: "application",
    isShared: true,
    createdBy: "admin",
    createdAt: "2023-10-01T12:00:00Z",
    updatedAt: "2023-10-01T12:00:00Z"
  },
  {
    id: "template-2",
    name: "Interview Request",
    description: "Request to schedule an interview with a candidate",
    subject: "Interview Request for {{position}} at GRO Early Learning",
    body: "Dear {{firstName}},\n\nWe've reviewed your application for the {{position}} role at GRO Early Learning and would like to schedule an interview with you.\n\nPlease let us know your availability for next week, and we'll arrange a suitable time.\n\nWe look forward to speaking with you!\n\nBest regards,\nRecruiting Team\nGRO Early Learning",
    category: "interview",
    isShared: true,
    createdBy: "admin",
    createdAt: "2023-10-02T14:30:00Z",
    updatedAt: "2023-10-02T14:30:00Z"
  },
  {
    id: "template-3",
    name: "Interview Confirmation",
    description: "Confirmation of scheduled interview",
    subject: "Your Interview Confirmation - {{position}} at GRO Early Learning",
    body: "Dear {{firstName}},\n\nThis email confirms your interview for the {{position}} role at GRO Early Learning scheduled for {{interviewDate}} at {{interviewTime}}.\n\nThe interview will take place at {{location}}. Please arrive 10 minutes early and bring your identification and any requested documents.\n\nIf you need to reschedule, please contact us as soon as possible.\n\nBest regards,\nRecruiting Team\nGRO Early Learning",
    category: "interview",
    isShared: true,
    createdBy: "admin",
    createdAt: "2023-10-03T09:15:00Z",
    updatedAt: "2023-10-03T09:15:00Z"
  },
  {
    id: "template-4",
    name: "Job Offer",
    description: "Formal job offer communication",
    subject: "Job Offer: {{position}} at GRO Early Learning",
    body: "Dear {{firstName}},\n\nWe're pleased to offer you the position of {{position}} at GRO Early Learning.\n\nAttached you'll find the official offer letter with details regarding compensation, benefits, and start date.\n\nPlease review the offer and respond with your acceptance by {{responseDeadline}}.\n\nWe're excited about the possibility of you joining our team!\n\nBest regards,\nRecruiting Team\nGRO Early Learning",
    category: "offer",
    isShared: true,
    createdBy: "admin",
    createdAt: "2023-10-04T16:45:00Z",
    updatedAt: "2023-10-04T16:45:00Z"
  },
  {
    id: "template-5",
    name: "Application Rejection",
    description: "Respectful rejection notification",
    subject: "Regarding Your Application to GRO Early Learning",
    body: "Dear {{firstName}},\n\nThank you for your interest in joining GRO Early Learning and for taking the time to apply for the {{position}} position.\n\nAfter careful consideration of all applications, we've decided to move forward with other candidates whose qualifications better match our current needs.\n\nWe appreciate your interest in our organization and wish you success in your job search.\n\nBest regards,\nRecruiting Team\nGRO Early Learning",
    category: "rejection",
    isShared: true,
    createdBy: "admin",
    createdAt: "2023-10-05T11:20:00Z",
    updatedAt: "2023-10-05T11:20:00Z"
  },
  {
    id: "template-6",
    name: "Reference Check Request",
    description: "Request for professional references",
    subject: "Reference Check Request - GRO Early Learning Application",
    body: "Dear {{firstName}},\n\nWe're moving forward with your application for the {{position}} role at GRO Early Learning and would like to conduct reference checks.\n\nPlease provide contact information for 2-3 professional references who can speak to your experience and qualifications.\n\nYou can reply to this email with the reference details or upload them through your candidate portal.\n\nBest regards,\nRecruiting Team\nGRO Early Learning",
    category: "reference",
    isShared: false,
    createdBy: "user1",
    createdAt: "2023-10-06T13:10:00Z",
    updatedAt: "2023-10-06T13:10:00Z"
  },
  {
    id: "template-7",
    name: "Onboarding Instructions",
    description: "Information for new hires about onboarding process",
    subject: "Welcome to GRO Early Learning - Your Onboarding Information",
    body: "Dear {{firstName}},\n\nCongratulations on joining GRO Early Learning as our new {{position}}! We're excited to have you on board.\n\nYour first day is scheduled for {{startDate}}. Please arrive at {{location}} at {{startTime}}.\n\nHere's what to bring on your first day:\n- Government-issued ID\n- Banking information for direct deposit\n- Tax forms (if not already submitted)\n- Working With Children Check documentation\n\nPlease complete the attached new hire paperwork prior to your start date.\n\nWe look forward to welcoming you to the team!\n\nBest regards,\nHR Team\nGRO Early Learning",
    category: "onboarding",
    isShared: true,
    createdBy: "admin",
    createdAt: "2023-10-07T10:30:00Z",
    updatedAt: "2023-10-07T10:30:00Z"
  }
];