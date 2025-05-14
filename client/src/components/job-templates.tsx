import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileTextIcon, ClipboardCopyIcon } from "lucide-react";

// Define template types for common early childhood roles
interface JobTemplate {
  id: string;
  title: string;
  qualifications: string;
  description: string;
  requirements: string;
  benefits: string;
  employmentType: string;
}

// Sample templates for common childcare roles
const jobTemplates: JobTemplate[] = [
  {
    id: "early-childhood-educator",
    title: "Early Childhood Educator",
    qualifications: "Diploma of Early Childhood Education and Care or Certificate III in Children's Services",
    description: "We are seeking a passionate Early Childhood Educator to join our team at GRO Early Learning. In this role, you will implement educational programs that support children's wellbeing, development, and learning through play-based approaches. You will work collaboratively with colleagues and families to create an inclusive, supportive environment.",
    requirements: "- Implement the Early Years Learning Framework (EYLF)\n- Document children's learning and development\n- Maintain safe and supportive learning environments\n- Build positive relationships with children and families\n- Work collaboratively with the teaching team\n- Ensure compliance with regulatory requirements",
    benefits: "- Supportive team environment\n- Ongoing professional development\n- Career advancement opportunities\n- Above-award wages\n- Employee wellness program",
    employmentType: "Full-time"
  },
  {
    id: "lead-educator",
    title: "Lead Educator",
    qualifications: "Diploma of Early Childhood Education and Care or Bachelor of Education (Early Childhood)",
    description: "GRO Early Learning is looking for an experienced Lead Educator to guide our educational program. In this leadership role, you will oversee room operations, mentor educators, and implement high-quality learning experiences for children. This position requires strong communication skills and the ability to build relationships with families.",
    requirements: "- Lead implementation of the curriculum framework\n- Mentor and support other educators\n- Design and implement educational programs\n- Conduct observations and assessments\n- Collaborate with families on children's development\n- Ensure all documentation is complete and compliant",
    benefits: "- Leadership professional development\n- Competitive salary package\n- Additional planning time\n- Mentoring opportunities\n- Paid professional development",
    employmentType: "Full-time"
  },
  {
    id: "center-director",
    title: "Center Director",
    qualifications: "Bachelor of Education (Early Childhood) or Diploma of Early Childhood Education and Care with 3+ years leadership experience",
    description: "We are seeking an experienced Center Director to provide leadership for our GRO Early Learning center. You will oversee daily operations, lead educational programs, manage staff, and ensure compliance with all regulations. As the Center Director, you will be responsible for maintaining high-quality care while building strong relationships with families and the community.",
    requirements: "- Manage center operations and staff\n- Ensure compliance with regulatory requirements\n- Implement and oversee educational programs\n- Build and maintain enrollment\n- Manage center budget and resources\n- Foster relationships with families and community\n- Lead professional development",
    benefits: "- Competitive salary package\n- Performance bonuses\n- Leadership development program\n- Healthcare benefits\n- Paid professional development\n- Additional leave entitlements",
    employmentType: "Full-time"
  }
];

interface JobTemplatesProps {
  onSelectTemplate: (template: JobTemplate) => void;
}

export function JobTemplates({ onSelectTemplate }: JobTemplatesProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const handleSelect = (template: JobTemplate) => {
    onSelectTemplate(template);
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileTextIcon className="h-4 w-4" />
          Use Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Job Posting Templates</DialogTitle>
          <DialogDescription>
            Select a template to quickly create a job posting. You can customize the details after selecting.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {jobTemplates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-md">{template.title}</CardTitle>
                <CardDescription className="text-xs truncate">{template.qualifications}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {template.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2"
                  onClick={() => handleSelect(template)}
                >
                  <ClipboardCopyIcon className="h-3.5 w-3.5" />
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default JobTemplates;