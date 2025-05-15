import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Check } from "lucide-react";
import { ApplicationForm } from "@/components/application-form";

export default function Apply() {
  const { jobId, hash } = useParams();
  const [, navigate] = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  // Validate the application link
  useEffect(() => {
    const validateLink = async () => {
      try {
        // Reset the state
        setIsValidating(true);
        setError(null);

        // Validate the link
        const response = await fetch(`/api/application-links/validate/${jobId}/${hash}`);
        const data = await response.json();

        if (!response.ok || !data.valid) {
          setIsValid(false);
          setError(data.message || "This application link is invalid or has expired.");
          setIsValidating(false);
          return;
        }

        // If valid, get job details
        setIsValid(true);
        setJobDetails(data.jobPosting);
        setIsValidating(false);
      } catch (error) {
        setIsValid(false);
        setError("An error occurred while validating the application link.");
        setIsValidating(false);
      }
    };

    if (jobId && hash) {
      validateLink();
    } else {
      setIsValid(false);
      setError("Invalid application link.");
      setIsValidating(false);
    }
  }, [jobId, hash]);

  const handleApplicationSubmit = () => {
    setApplicationSubmitted(true);
  };

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <Card className="w-full max-w-lg shadow-lg">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-lg">Validating application link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (applicationSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <Card className="w-full max-w-lg shadow-lg">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your application. We will review your details and get back to you soon.
            </p>
            <Button onClick={() => window.location.href = 'https://www.groearlylearning.com.au'}>
              Return to GRO Early Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <Card className="w-full max-w-lg shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Invalid Application Link</h2>
            <p className="text-gray-600 mb-6">{error || "This application link is invalid or has expired."}</p>
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
            <CardTitle className="text-2xl">Apply for: {jobDetails?.title}</CardTitle>
            <CardDescription>
              Complete the form below to apply for this position at GRO Early Learning.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ApplicationForm 
              jobId={Number(jobId)} 
              onApplicationSubmitted={handleApplicationSubmit}
              jobTitle={jobDetails?.title}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}