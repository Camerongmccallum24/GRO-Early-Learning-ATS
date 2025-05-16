import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Briefcase, 
  GraduationCap, 
  ListChecks, 
  Package, 
  CalendarRange,
  ArrowRight
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";

interface JobPostingPageProps {
  jobId?: string;
  seoMode?: boolean;
  category?: string;
  slug?: string;
}

export default function JobPostingPage({ 
  jobId: propJobId, 
  seoMode = false,
  category,
  slug
}: JobPostingPageProps) {
  // Get URL parameters either from props or from useParams
  const params = useParams();
  const jobId = propJobId || params.jobId;
  
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      setIsLoading(true);
      
      try {
        // Fetch job details
        const response = await fetch(`/api/job-postings/${jobId}`);
        
        if (!response.ok) {
          setError("Job posting not found or no longer available.");
          setIsLoading(false);
          return;
        }
        
        const jobData = await response.json();
        
        // Verify job is active
        if (jobData.status !== 'active') {
          setError("This job is no longer accepting applications.");
          setIsLoading(false);
          return;
        }
        
        // If the job exists and is active, it's valid
        setJobDetails(jobData);
        setIsLoading(false);
      } catch (err) {
        setError("An error occurred while retrieving job details.");
        setIsLoading(false);
      }
    };
    
    if (jobId) {
      fetchJobDetails();
    } else {
      setError("Invalid job posting.");
      setIsLoading(false);
    }
  }, [jobId]);

  // Handle Apply Now button click
  const handleApplyNow = () => {
    // Construct the URL based on seoMode
    if (seoMode && category && slug) {
      navigate(`/careers/${category}/${slug}?apply=true`);
    } else {
      navigate(`/apply/${jobId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <Card className="w-full max-w-lg shadow-lg">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-lg">Loading job details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <Card className="w-full max-w-lg shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Job Not Available</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.href = 'https://www.groearlylearning.com.au'}>
              Return to GRO Early Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto w-full">
        <Card className="shadow-lg mb-6">
          <CardHeader className="border-b bg-white">
            <div className="mb-4">
              <img 
                src="/Gro-Logo-01 (1).png" 
                alt="GRO Early Learning" 
                className="h-12 mb-4" 
              />
            </div>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <CardTitle className="text-3xl font-bold text-primary">{jobDetails?.title}</CardTitle>
                {jobDetails?.location && (
                  <div className="flex items-center mt-2 text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{jobDetails.location}</span>
                  </div>
                )}
              </div>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90"
                onClick={handleApplyNow}
              >
                Apply Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {/* Job Overview Section */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {jobDetails?.employmentType && (
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Employment Type</h3>
                    <p className="text-gray-600">{jobDetails.employmentType}</p>
                  </div>
                </div>
              )}
              
              {jobDetails?.salaryRange && (
                <div className="flex items-start">
                  <Package className="h-5 w-5 mr-2 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Salary Range</h3>
                    <p className="text-gray-600">{jobDetails.salaryRange}</p>
                  </div>
                </div>
              )}
              
              {jobDetails?.deadline && (
                <div className="flex items-start">
                  <CalendarRange className="h-5 w-5 mr-2 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Application Deadline</h3>
                    <p className="text-gray-600">{formatDate(jobDetails.deadline)}</p>
                  </div>
                </div>
              )}
            </div>
            
            <Separator className="my-6" />
            
            {/* Job Description */}
            {jobDetails?.description && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary" />
                  Job Description
                </h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: jobDetails.description }} />
              </div>
            )}
            
            {/* Qualifications */}
            {jobDetails?.qualifications && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                  Qualifications
                </h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: jobDetails.qualifications }} />
              </div>
            )}
            
            {/* Requirements */}
            {jobDetails?.requirements && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <ListChecks className="h-5 w-5 mr-2 text-primary" />
                  Requirements
                </h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: jobDetails.requirements }} />
              </div>
            )}
            
            {/* Benefits */}
            {jobDetails?.benefits && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-primary" />
                  Benefits
                </h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: jobDetails.benefits }} />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t flex justify-center py-6 bg-gray-50">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 w-full md:w-auto"
              onClick={handleApplyNow}
            >
              Apply Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function useParams() {
  const [location] = useLocation();
  
  // Extract jobId from the path
  const matches = location.match(/\/job-posting\/(\d+)/) || 
                  location.match(/\/careers\/[^\/]+\/([^-]+-[^-]+-\d+)$/);
  
  if (matches && matches[1]) {
    // If it's the SEO format (slug containing jobId at the end), extract the jobId
    if (matches[1].includes('-')) {
      const parts = matches[1].split('-');
      return { jobId: parts[parts.length - 1] };
    }
    return { jobId: matches[1] };
  }
  
  return {};
}