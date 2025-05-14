import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { AdminGuides } from "@/components/admin-guides";
import {
  BookOpenIcon,
  SearchIcon,
  VideoIcon,
  CheckCircleIcon,
  UsersIcon,
  MessageSquareIcon,
  FileTextIcon,
  MailIcon,
  BriefcaseIcon,
  CalendarIcon,
  SparklesIcon,
  BarChart3Icon
} from "lucide-react";

export default function HowToGuides() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Define guide categories and content
  const guideCategories = [
    { id: "getting-started", label: "Getting Started" },
    { id: "job-postings", label: "Job Postings" },
    { id: "applications", label: "Applications" },
    { id: "candidates", label: "Candidates" },
    { id: "interviews", label: "Interviews" },
    { id: "ai-features", label: "AI Features" },
  ];
  
  const guides = [
    {
      id: 1,
      category: "getting-started",
      title: "ATS System Overview",
      description: "An introduction to the GRO Early Learning Applicant Tracking System",
      icon: BookOpenIcon,
      content: [
        {
          type: "paragraph",
          text: "The GRO Early Learning Applicant Tracking System (ATS) is designed to streamline your recruitment process across all childcare centers. This guide will walk you through the key features and how to navigate the system."
        },
        {
          type: "paragraph",
          text: "The main dashboard provides an overview of your recruitment metrics with quick access to recent applications. From there, you can navigate to job postings, applications, and candidate management using the sidebar."
        },
        {
          type: "steps",
          items: [
            "Navigate using the sidebar menu on the left",
            "View recruitment metrics on the dashboard",
            "Manage job postings for different center locations",
            "Track and process applications through each stage",
            "Maintain a candidate database with communication history"
          ]
        }
      ]
    },
    {
      id: 2,
      category: "getting-started",
      title: "User Roles and Permissions",
      description: "Understanding different access levels in the system",
      icon: UsersIcon,
      content: [
        {
          type: "paragraph",
          text: "The ATS has different user roles to control access to sensitive information and actions. Each role is designed to provide the appropriate level of access based on job responsibilities."
        },
        {
          type: "list",
          items: [
            {
              title: "HR Admin",
              description: "Full access to all features including creating users, editing job templates, and viewing all data"
            },
            {
              title: "Center Director",
              description: "Can manage job postings and applications for their specific center, view candidates, schedule interviews"
            },
            {
              title: "Recruiter",
              description: "Can view and manage applications, communicate with candidates, schedule interviews, but cannot create job postings"
            },
            {
              title: "Hiring Manager",
              description: "Limited access to view applications and candidates for positions they're hiring for"
            }
          ]
        }
      ]
    },
    {
      id: 3,
      category: "job-postings",
      title: "Creating a New Job Posting",
      description: "Step-by-step guide to create and publish job postings",
      icon: BriefcaseIcon,
      content: [
        {
          type: "paragraph",
          text: "Creating effective job postings is crucial for attracting qualified candidates. This guide will walk you through the process of creating and publishing a new job posting."
        },
        {
          type: "steps",
          items: [
            "Navigate to the Job Postings page from the sidebar",
            "Click the 'Create New Job' button in the top-right corner",
            "Fill in all required fields including title, description, requirements, and location",
            "Select a center location from the dropdown menu",
            "Choose the employment type (full-time, part-time, casual)",
            "Add specific qualifications and requirements for the position",
            "Set the salary range if appropriate to display",
            "Review all information for accuracy",
            "Click 'Publish' to make the job visible to applicants"
          ]
        },
        {
          type: "paragraph",
          text: "Once published, the job will appear on your careers page and you'll start receiving applications through the system."
        }
      ]
    },
    {
      id: 4,
      category: "applications",
      title: "Processing Applications",
      description: "How to review and manage incoming applications",
      icon: FileTextIcon,
      content: [
        {
          type: "paragraph",
          text: "The Applications page is where you'll spend much of your time reviewing candidate submissions and moving them through your hiring process."
        },
        {
          type: "steps",
          items: [
            "Navigate to the Applications page from the sidebar",
            "Use filters to sort by status, job posting, or location",
            "Click on an application to view the full details",
            "Review the candidate's resume, cover letter, and application responses",
            "Change the application status using the dropdown or button options",
            "Add notes visible to your team members",
            "Schedule interviews or send email communications directly from the application view"
          ]
        },
        {
          type: "paragraph",
          text: "Application statuses follow a standard workflow from 'Application Received' through 'Interview', 'Offer', and ultimately 'Hired' or 'Rejected'. Each status change is logged in the activity timeline for audit purposes."
        }
      ]
    },
    {
      id: 5,
      category: "candidates",
      title: "Candidate Management",
      description: "Organizing and tracking candidate information",
      icon: UsersIcon,
      content: [
        {
          type: "paragraph",
          text: "The Candidates page provides a centralized database of all applicants who have applied to your organization, regardless of the specific position."
        },
        {
          type: "paragraph",
          text: "This allows you to maintain a talent pool and consider candidates for different positions over time."
        },
        {
          type: "steps",
          items: [
            "Access the Candidates page from the sidebar",
            "Search for candidates by name, email, or skills",
            "View a candidate's complete profile including all applications they've submitted",
            "Review qualification documents, certifications, and working with children checks",
            "See communication history with each candidate",
            "Add tags to categorize candidates by skills or qualifications",
            "Export candidate data for reporting or integration with other systems"
          ]
        }
      ]
    },
    {
      id: 6,
      category: "candidates",
      title: "Communication Logs",
      description: "Recording all interactions with candidates",
      icon: MessageSquareIcon,
      content: [
        {
          type: "paragraph",
          text: "Maintaining detailed communication records is essential for a smooth hiring process and compliance requirements. The system allows you to log all candidate interactions in one place."
        },
        {
          type: "steps",
          items: [
            "Open a candidate's profile or application details",
            "Scroll to the Communication Logs section",
            "View previous email, phone, or in-person communication history",
            "Click 'Add Communication Log' to record a new interaction",
            "Select the communication type (email, phone, in-person, video)",
            "Enter notes about the conversation or interaction",
            "Save the log to add it to the candidate's history"
          ]
        },
        {
          type: "paragraph",
          text: "Communication logs are timestamped and linked to the specific user who created them, creating an audit trail for all candidate interactions."
        }
      ]
    },
    {
      id: 7,
      category: "interviews",
      title: "Scheduling Video Interviews",
      description: "Setting up and managing virtual interviews with candidates",
      icon: VideoIcon,
      content: [
        {
          type: "paragraph",
          text: "Video interviews are a convenient way to connect with candidates without requiring them to travel to your location. The system provides tools to schedule and manage these virtual meetings."
        },
        {
          type: "steps",
          items: [
            "Navigate to a candidate's application",
            "Click 'Schedule Interview' button",
            "Select 'Video Interview' as the interview type",
            "Choose available date and time options",
            "Add interview panel members from your team",
            "Include specific questions or assessment criteria",
            "Save the interview schedule",
            "The system will send an email invitation to the candidate with connection details"
          ]
        },
        {
          type: "paragraph",
          text: "After the interview, you can record the outcome, add notes, and update the application status directly from the interview details page."
        }
      ]
    },
    {
      id: 8,
      category: "interviews",
      title: "Interview Assessment Forms",
      description: "Standardizing candidate evaluation during interviews",
      icon: CheckCircleIcon,
      content: [
        {
          type: "paragraph",
          text: "Assessment forms help ensure all candidates are evaluated consistently across the same criteria, leading to more objective hiring decisions."
        },
        {
          type: "steps",
          items: [
            "Set up assessment criteria before the interview",
            "Share the assessment form with all interview panel members",
            "During or after the interview, rate the candidate on each criterion",
            "Add specific notes and examples to support your ratings",
            "Submit completed assessments",
            "View aggregated scores from all interviewers",
            "Use the assessment results to compare candidates objectively"
          ]
        },
        {
          type: "paragraph",
          text: "Standard assessment areas include teaching philosophy, classroom management approach, teamwork examples, communication skills, and understanding of early childhood development appropriate to the role."
        }
      ]
    },
    {
      id: 9,
      category: "applications",
      title: "Bulk Actions for Applications",
      description: "Processing multiple applications efficiently",
      icon: FileTextIcon,
      content: [
        {
          type: "paragraph",
          text: "When dealing with a high volume of applications, bulk actions can save significant time by allowing you to perform the same action on multiple candidates at once."
        },
        {
          type: "steps",
          items: [
            "Go to the Applications page",
            "Use checkboxes to select multiple applications",
            "Click the 'Bulk Actions' dropdown menu",
            "Choose from options like 'Update Status', 'Send Email', or 'Export'",
            "Confirm your selection when prompted",
            "The system will process all selected applications"
          ]
        },
        {
          type: "paragraph",
          text: "This feature is particularly useful for moving groups of candidates to the next stage, sending similar communications, or rejecting multiple applications that don't meet basic requirements."
        }
      ]
    },
    {
      id: 10,
      category: "ai-features",
      title: "AI-Powered Resume Parsing",
      description: "Using AI to extract candidate qualifications automatically",
      icon: SparklesIcon,
      content: [
        {
          type: "paragraph",
          text: "The system uses advanced AI to automatically extract and organize information from candidate resumes, saving time and ensuring consistent data entry."
        },
        {
          type: "paragraph",
          text: "When a candidate uploads their resume, the AI parser automatically extracts key information like work experience, education, skills, and certifications."
        },
        {
          type: "steps",
          items: [
            "The AI parser works automatically when resumes are uploaded",
            "View parsed information in the candidate profile",
            "Check the 'Skills' and 'Qualifications' sections for extracted data",
            "Review and edit any information if needed",
            "Use the extracted skills for candidate matching and searching"
          ]
        },
        {
          type: "paragraph",
          text: "The AI is particularly trained to recognize early childhood education qualifications, teaching certifications, and relevant experience in educational settings."
        }
      ]
    },
    {
      id: 11,
      category: "ai-features",
      title: "AI Email Assistant",
      description: "Generate professional candidate communications with AI",
      icon: MailIcon,
      content: [
        {
          type: "paragraph",
          text: "Our AI email assistant helps you create personalized, professional communications for candidates at different stages of the application process."
        },
        {
          type: "steps",
          items: [
            "Navigate to a candidate's application page",
            "Click 'Send Email' to open the email form",
            "Toggle on the 'AI-Assisted Email' switch",
            "Select the appropriate context from the dropdown (follow-up, interview invitation, etc.)",
            "Add any specific details you want included in the 'Additional Context' field",
            "Click 'Generate with AI' to create a personalized message",
            "Review and edit the generated content as needed",
            "Send the email when you're satisfied with the content"
          ]
        },
        {
          type: "paragraph",
          text: "The AI adapts its tone and content based on the application stage and context you select, creating appropriate messaging for each situation while maintaining your organization's voice."
        }
      ]
    },
    {
      id: 12,
      category: "ai-features",
      title: "Candidate-Job Matching",
      description: "AI analysis of candidate fit for specific positions",
      icon: BriefcaseIcon,
      content: [
        {
          type: "paragraph",
          text: "The AI matching feature analyzes candidate resumes against job requirements to identify the most suitable candidates for each position."
        },
        {
          type: "steps",
          items: [
            "View an application to see the AI-generated match score",
            "Click on the match percentage to see a detailed breakdown",
            "Review which requirements are met and which are missing",
            "Use match scores to prioritize which applications to review first",
            "Filter applications by match score to focus on top candidates"
          ]
        },
        {
          type: "paragraph",
          text: "The matching algorithm considers not just keywords but the context of experience, weighing factors like recency of experience, education level, and specific certifications required for early childhood education roles."
        }
      ]
    },
    {
      id: 13,
      category: "getting-started",
      title: "Dashboard Overview",
      description: "Understanding your recruitment metrics",
      icon: BarChart3Icon,
      content: [
        {
          type: "paragraph",
          text: "The dashboard provides at-a-glance insights into your recruitment process with key metrics and visualizations."
        },
        {
          type: "list",
          items: [
            {
              title: "Active Jobs",
              description: "Total number of currently published job postings"
            },
            {
              title: "New Applications",
              description: "Applications received in the past 7 days"
            },
            {
              title: "Upcoming Interviews",
              description: "Scheduled interviews for the next 14 days"
            },
            {
              title: "Positions Filled",
              description: "Successfully completed hires in the current month"
            }
          ]
        },
        {
          type: "paragraph",
          text: "The dashboard also shows visualizations of application distribution by location and position type, helping you identify trends and focus your recruitment efforts effectively."
        }
      ]
    },
    {
      id: 14,
      category: "job-postings",
      title: "Job Posting Templates",
      description: "Create and use templates for faster job creation",
      icon: FileTextIcon,
      content: [
        {
          type: "paragraph",
          text: "Templates allow you to standardize job postings for common roles across different centers, ensuring consistency while saving time."
        },
        {
          type: "steps",
          items: [
            "Navigate to Job Postings > Templates",
            "Click 'Create New Template'",
            "Fill in standard details for the position type",
            "Save the template with a descriptive name",
            "When creating a new job, select 'Use Template' and choose from your saved templates",
            "Modify the template-filled information as needed for the specific posting"
          ]
        },
        {
          type: "paragraph",
          text: "Templates are particularly useful for roles you hire for regularly across different centers, such as Early Childhood Educators, Lead Educators, and Assistant positions."
        }
      ]
    },
    {
      id: 15,
      category: "ai-features",
      title: "Communication Sentiment Analysis",
      description: "AI-powered analysis of candidate engagement",
      icon: MessageSquareIcon,
      content: [
        {
          type: "paragraph",
          text: "The sentiment analysis feature uses AI to evaluate the tone and engagement level in candidate communications, helping you identify potential concerns or particularly enthusiastic candidates."
        },
        {
          type: "paragraph",
          text: "This feature works by analyzing the language used in email exchanges and interview notes to gauge candidate interest and engagement."
        },
        {
          type: "list",
          items: [
            {
              title: "Sentiment Score",
              description: "Overall positivity or negativity detected in communications (1-5 scale)"
            },
            {
              title: "Engagement Level",
              description: "Indicates candidate's level of interest based on response patterns"
            },
            {
              title: "Key Phrases",
              description: "Highlights particularly positive or negative expressions used"
            }
          ]
        },
        {
          type: "paragraph",
          text: "This information can help you prioritize candidates who show genuine enthusiasm for the role and identify those who might be considering other offers or have hesitations."
        }
      ]
    }
  ];
  
  // Filter guides based on search term
  const filterGuides = (guides, category, searchTerm) => {
    return guides.filter(guide => 
      guide.category === category && 
      (searchTerm === "" || 
        guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };
  
  // Render different content types within guides
  const renderContent = (content) => {
    return content.map((item, index) => {
      switch (item.type) {
        case "paragraph":
          return <p key={index} className="mb-4 text-gray-700">{item.text}</p>;
        
        case "steps":
          return (
            <div key={index} className="mb-4">
              <h4 className="font-medium mb-2 text-gray-900">Steps:</h4>
              <ol className="list-decimal pl-5 space-y-1 text-gray-700">
                {item.items.map((step, stepIdx) => (
                  <li key={stepIdx}>{step}</li>
                ))}
              </ol>
            </div>
          );
        
        case "list":
          return (
            <div key={index} className="mb-4">
              <ul className="space-y-3 text-gray-700">
                {item.items.map((listItem, listIdx) => (
                  <li key={listIdx} className="border-l-2 border-blue-500 pl-3 py-1">
                    <span className="font-medium text-gray-900">{listItem.title}: </span>
                    {listItem.description}
                  </li>
                ))}
              </ul>
            </div>
          );
          
        default:
          return null;
      }
    });
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">How To Guides</h1>
          <p className="text-muted-foreground mt-2">
            Learn how to use the GRO Early Learning Applicant Tracking System effectively
          </p>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Search guides..." 
            className="pl-10 w-full md:w-1/2 lg:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="flex flex-wrap mb-6 h-auto">
            {guideCategories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {guideCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="space-y-6">
              {filterGuides(guides, category.id, searchTerm).length > 0 ? (
                filterGuides(guides, category.id, searchTerm).map(guide => (
                  <Card key={guide.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 flex flex-row items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <guide.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{guide.title}</CardTitle>
                        <CardDescription>{guide.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {renderContent(guide.content)}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <BookOpenIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No guides found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 
                      `No guides matching "${searchTerm}" in this category` : 
                      "No guides available in this category yet"}
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}