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
  Sparkles, 
  CalendarRange,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  BookOpen,
  Users,
  Award,
  Heart
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

  // Check if this is the Lead Educator job
  const isLeadEducator = jobDetails?.title === "Lead Educator";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto w-full">
        <Card className="shadow-lg mb-6 overflow-hidden">
          {/* Header with branding and "Apply Now" button */}
          <CardHeader className="border-b bg-gradient-to-r from-[#87b6ad]/20 to-white">
            <div className="mb-4">
              <img 
                src="/Gro-Logo-01 (1).png" 
                alt="GRO Early Learning" 
                className="h-16 mb-4" 
              />
            </div>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <CardTitle className="text-3xl font-bold text-[#2c2c2c]">
                  {isLeadEducator ? "Lead Educator – Join the Gro Early Learning Family" : jobDetails?.title}
                </CardTitle>
                {jobDetails?.locationId && (
                  <div className="flex items-center mt-2 text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 text-[#87b6ad]" />
                    <span>{jobDetails.locationName || "GRO Early Learning Center - Brisbane CBD"}</span>
                  </div>
                )}
              </div>
              <Button 
                size="lg" 
                className="bg-[#e89174] hover:bg-[#e89174]/90 text-white"
                onClick={handleApplyNow}
              >
                Apply Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {/* Introduction - Custom for Lead Educator */}
            {isLeadEducator && (
              <div className="mb-8 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-lg text-gray-700 leading-relaxed">
                  At Gro Early Learning, we believe in cultivating a nurturing environment where both children and educators flourish. 
                  Our commitment to excellence in early childhood education is matched by our dedication to our team.
                </p>
              </div>
            )}
            
            {/* Job Overview Section - Standard info */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {jobDetails?.employmentType && (
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-[#87b6ad] mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Employment Type</h3>
                    <p className="text-gray-600">
                      {jobDetails.employmentType === "full_time" ? "Full Time" : 
                       jobDetails.employmentType === "part_time" ? "Part Time" : 
                       jobDetails.employmentType === "casual" ? "Casual" : 
                       jobDetails.employmentType}
                    </p>
                  </div>
                </div>
              )}
              
              {(jobDetails?.salaryRange || isLeadEducator) && (
                <div className="flex items-start">
                  <Award className="h-5 w-5 mr-2 text-[#87b6ad] mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Salary</h3>
                    <p className="text-gray-600">{jobDetails.salaryRange || "Competitive package based on experience"}</p>
                  </div>
                </div>
              )}
              
              {(jobDetails?.deadline || isLeadEducator) && (
                <div className="flex items-start">
                  <CalendarRange className="h-5 w-5 mr-2 text-[#87b6ad] mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Application Deadline</h3>
                    <p className="text-gray-600">{jobDetails.deadline ? formatDate(jobDetails.deadline) : "Open until filled"}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Why Choose GRO - Custom for Lead Educator */}
            {isLeadEducator && (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 text-[#2c2c2c] flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-[#e89174]" />
                    Why Choose Gro?
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-start mb-2">
                        <Sparkles className="h-5 w-5 mr-2 text-[#e89174] mt-1" />
                        <h3 className="font-semibold text-[#2c2c2c]">Innovative Programs</h3>
                      </div>
                      <p className="text-gray-700 ml-7">Engage with unique initiatives like Mini Master Chef, STEM Exploration, and Nature Play.</p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-start mb-2">
                        <BookOpen className="h-5 w-5 mr-2 text-[#e89174] mt-1" />
                        <h3 className="font-semibold text-[#2c2c2c]">Professional Growth</h3>
                      </div>
                      <p className="text-gray-700 ml-7">Access continuous learning opportunities and career advancement pathways.</p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-start mb-2">
                        <Users className="h-5 w-5 mr-2 text-[#e89174] mt-1" />
                        <h3 className="font-semibold text-[#2c2c2c]">Inclusive Culture</h3>
                      </div>
                      <p className="text-gray-700 ml-7">Be part of a team that values diversity, collaboration, and mutual respect.</p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-start mb-2">
                        <HeartHandshake className="h-5 w-5 mr-2 text-[#e89174] mt-1" />
                        <h3 className="font-semibold text-[#2c2c2c]">Supportive Environment</h3>
                      </div>
                      <p className="text-gray-700 ml-7">Experience the warmth and dedication of a family-run organization.</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />
              </>
            )}
            
            {/* Position Overview - Custom for Lead Educator */}
            {isLeadEducator ? (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-[#2c2c2c] flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-[#87b6ad]" />
                  Position Overview
                </h2>
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                  <p className="text-gray-700 leading-relaxed">
                    As a Lead Educator, you will play a pivotal role in shaping young minds and leading a team of dedicated educators. 
                    Your leadership will ensure the delivery of high-quality early childhood education aligned with Gro's values and the National Quality Framework.
                  </p>
                </div>
              </div>
            ) : (
              // Standard job description for other positions
              jobDetails?.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 text-[#2c2c2c] flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-[#87b6ad]" />
                    Job Description
                  </h2>
                  <div className="prose max-w-none bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <div dangerouslySetInnerHTML={{ __html: jobDetails.description }} />
                  </div>
                </div>
              )
            )}
            
            {/* Key Responsibilities - Custom for Lead Educator */}
            {isLeadEducator ? (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-[#2c2c2c] flex items-center">
                  <ListChecks className="h-5 w-5 mr-2 text-[#87b6ad]" />
                  Key Responsibilities
                </h2>
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                  <ul className="space-y-3">
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#87b6ad] flex-shrink-0 mt-0.5" />
                      <span>Develop and implement engaging, age-appropriate learning experiences.</span>
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#87b6ad] flex-shrink-0 mt-0.5" />
                      <span>Mentor and support educators to foster a collaborative and effective teaching environment.</span>
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#87b6ad] flex-shrink-0 mt-0.5" />
                      <span>Monitor and document children's progress, ensuring individual developmental needs are met.</span>
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#87b6ad] flex-shrink-0 mt-0.5" />
                      <span>Build strong relationships with families, providing regular updates and support.</span>
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#87b6ad] flex-shrink-0 mt-0.5" />
                      <span>Ensure adherence to all regulatory requirements and Gro's policies and procedures.</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              // Standard requirements for other positions
              jobDetails?.requirements && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 text-[#2c2c2c] flex items-center">
                    <ListChecks className="h-5 w-5 mr-2 text-[#87b6ad]" />
                    Requirements
                  </h2>
                  <div className="prose max-w-none bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <div dangerouslySetInnerHTML={{ __html: jobDetails.requirements }} />
                  </div>
                </div>
              )
            )}
            
            {/* Qualifications - Custom for Lead Educator */}
            {isLeadEducator ? (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-[#2c2c2c] flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-[#87b6ad]" />
                  Qualifications & Experience
                </h2>
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-[#2c2c2c] mb-3">Essential:</h3>
                  <ul className="space-y-2 mb-5">
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#87b6ad] flex-shrink-0 mt-0.5" />
                      <span>Diploma or Bachelor's degree in Early Childhood Education (or equivalent).</span>
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#87b6ad] flex-shrink-0 mt-0.5" />
                      <span>Minimum of 2 years' experience in a similar role.</span>
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#87b6ad] flex-shrink-0 mt-0.5" />
                      <span>Current First Aid and CPR certifications.</span>
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#87b6ad] flex-shrink-0 mt-0.5" />
                      <span>Working with Children Check clearance.</span>
                    </li>
                  </ul>
                  
                  <h3 className="font-semibold text-[#2c2c2c] mb-3">Desirable:</h3>
                  <ul className="space-y-2">
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#e89174] flex-shrink-0 mt-0.5" />
                      <span>Experience with the Early Years Learning Framework (EYLF).</span>
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#e89174] flex-shrink-0 mt-0.5" />
                      <span>Strong leadership and team management skills.</span>
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#e89174] flex-shrink-0 mt-0.5" />
                      <span>Excellent communication and interpersonal abilities.</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              // Standard qualifications for other positions
              jobDetails?.qualifications && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 text-[#2c2c2c] flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-[#87b6ad]" />
                    Qualifications
                  </h2>
                  <div className="prose max-w-none bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <div dangerouslySetInnerHTML={{ __html: jobDetails.qualifications }} />
                  </div>
                </div>
              )
            )}
            
            {/* Benefits - Custom for Lead Educator */}
            {isLeadEducator ? (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-[#2c2c2c] flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-[#87b6ad]" />
                  Benefits
                </h2>
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                  <ul className="space-y-3">
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#87b6ad] flex-shrink-0 mt-0.5" />
                      <span>Competitive salary reflective of your experience and qualifications.</span>
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#87b6ad] flex-shrink-0 mt-0.5" />
                      <span>Regular training sessions and professional development workshops.</span>
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#87b6ad] flex-shrink-0 mt-0.5" />
                      <span>Access to employee assistance programs and wellness initiatives.</span>
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#87b6ad] flex-shrink-0 mt-0.5" />
                      <span>Opportunities to advance within the Gro Early Learning network.</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              // Standard benefits for other positions
              jobDetails?.benefits && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 text-[#2c2c2c] flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-[#87b6ad]" />
                    Benefits
                  </h2>
                  <div className="prose max-w-none bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <div dangerouslySetInnerHTML={{ __html: jobDetails.benefits }} />
                  </div>
                </div>
              )
            )}
            
            {/* Testimonials - Custom for Lead Educator */}
            {isLeadEducator && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-[#2c2c2c] flex items-center">
                  <Users className="h-5 w-5 mr-2 text-[#87b6ad]" />
                  What Our Team Says
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <p className="italic text-gray-700 mb-4">
                      "Working at Gro has been a transformative experience. The support and opportunities for growth are unparalleled."
                    </p>
                    <p className="font-semibold text-[#2c2c2c]">— Emily R., Lead Educator</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <p className="italic text-gray-700 mb-4">
                      "The collaborative environment and innovative programs make every day rewarding."
                    </p>
                    <p className="font-semibold text-[#2c2c2c]">— James T., Centre Director</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* How to Apply - Custom for Lead Educator */}
            {isLeadEducator && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-[#2c2c2c] flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-[#87b6ad]" />
                  How to Apply
                </h2>
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                  <ol className="list-decimal pl-5 space-y-3">
                    <li className="pl-2">
                      Prepare your resume and a cover letter detailing your experience and passion for early childhood education.
                    </li>
                    <li className="pl-2">
                      Submit your application via the apply now button.
                    </li>
                    <li className="pl-2">
                      Our recruitment team will review your application and contact you for the next steps.
                    </li>
                  </ol>
                </div>
              </div>
            )}
            
            {/* Closing Message - Custom for Lead Educator */}
            {isLeadEducator && (
              <div className="bg-gradient-to-r from-[#87b6ad]/10 to-white p-6 rounded-lg border border-gray-100 shadow-sm text-center">
                <p className="text-[#2c2c2c] font-medium text-lg">
                  Join Gro Early Learning and make a meaningful impact on the lives of children and their families. 
                  We look forward to welcoming passionate educators to our team!
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t flex justify-center py-6 bg-gradient-to-r from-[#87b6ad]/10 to-white">
            <Button 
              size="lg" 
              className="bg-[#e89174] hover:bg-[#e89174]/90 text-white w-full md:w-auto"
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