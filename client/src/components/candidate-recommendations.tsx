import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  SparklesIcon, 
  UserIcon, 
  ChevronRightIcon, 
  ArrowUpCircleIcon, 
  ArrowDownCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  Loader2Icon
} from "lucide-react";

interface CandidateRecommendation {
  candidateId: number;
  name: string;
  matchScore: number;
  strengths: string[];
  growthAreas: string[];
  comments: string;
}

interface CandidateRecommendationsProps {
  jobPostingId: number;
  jobTitle: string;
}

export function CandidateRecommendations({ jobPostingId, jobTitle }: CandidateRecommendationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CandidateRecommendation[]>([]);
  const [analysisInsights, setAnalysisInsights] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call API to get candidate recommendations
      const response = await apiRequest(`/api/job-postings/${jobPostingId}/recommend-candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count: 5 }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to get recommendations");
      }
      
      setRecommendations(data.recommendations || []);
      setAnalysisInsights(data.analysisInsights || "");
      
      if (data.recommendations?.length === 0) {
        toast({
          title: "No recommendations available",
          description: "There are no suitable candidates for this position in the database.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error("Error getting recommendations:", err);
      setError(err.message || "Failed to get candidate recommendations");
      toast({
        title: "Error",
        description: err.message || "Failed to get candidate recommendations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render a badge with the match score and appropriate color
  const renderMatchScore = (score: number) => {
    let color = "";
    
    if (score >= 90) color = "bg-green-100 text-green-800 border-green-300";
    else if (score >= 75) color = "bg-emerald-100 text-emerald-800 border-emerald-300";
    else if (score >= 60) color = "bg-blue-100 text-blue-800 border-blue-300";
    else if (score >= 45) color = "bg-orange-100 text-orange-800 border-orange-300";
    else color = "bg-rose-100 text-rose-800 border-rose-300";
    
    return (
      <div className="flex flex-col items-center gap-1">
        <div className={`text-sm font-medium rounded-full px-3 py-1 border ${color}`}>
          {score}% Match
        </div>
        <Progress value={score} className="w-24 h-2" />
      </div>
    );
  };
  
  return (
    <Card className="mt-6">
      <CardHeader className="bg-muted/50 flex flex-row items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <SparklesIcon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <CardTitle className="text-xl">AI Candidate Recommendations</CardTitle>
          <CardDescription>
            Find the best candidates for this position using AI-powered matching
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {recommendations.length === 0 && !isLoading && !error ? (
          <div className="text-center py-8">
            <UserIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium">No Recommendations Yet</h3>
            <p className="text-muted-foreground mb-6">
              Generate AI-powered recommendations to find the best candidates for this position
            </p>
            <Button
              onClick={getRecommendations}
              className="gap-2"
            >
              <SparklesIcon className="h-4 w-4" />
              Generate Recommendations
            </Button>
          </div>
        ) : null}

        {isLoading && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-center py-4">
              <div className="flex flex-col items-center gap-2">
                <Loader2Icon className="h-8 w-8 text-primary animate-spin" />
                <p className="text-muted-foreground text-sm">
                  AI is analyzing candidates for {jobTitle}...
                </p>
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-6">
            <XCircleIcon className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h3 className="text-lg font-medium">Error Getting Recommendations</h3>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Button
              onClick={getRecommendations}
              variant="outline"
              className="gap-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {recommendations.length > 0 && !isLoading && (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">AI Analysis Insights</h3>
              <p className="text-muted-foreground text-sm">{analysisInsights}</p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Recommended Candidates</h3>
              {recommendations.map((candidate) => (
                <div 
                  key={candidate.candidateId} 
                  className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border rounded-lg hover:bg-muted/25 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-lg">
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium">{candidate.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {candidate.comments}
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-0 md:ml-auto flex flex-col md:flex-row items-start md:items-center gap-3">
                    {renderMatchScore(candidate.matchScore)}
                    
                    <Accordion type="single" collapsible className="w-full md:w-auto">
                      <AccordionItem value="details" className="border-none">
                        <AccordionTrigger className="py-1 px-2">
                          <span className="text-sm">Details</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-1">
                          <div className="space-y-2 p-2 bg-muted/30 rounded-md">
                            <div>
                              <h5 className="text-xs font-medium flex items-center gap-1 mb-1">
                                <ArrowUpCircleIcon className="h-3 w-3 text-emerald-600" />
                                Strengths
                              </h5>
                              <ul className="text-xs space-y-1">
                                {candidate.strengths.map((strength, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <CheckCircleIcon className="h-3 w-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                                    <span>{strength}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="text-xs font-medium flex items-center gap-1 mb-1">
                                <ArrowDownCircleIcon className="h-3 w-3 text-amber-600" />
                                Growth Areas
                              </h5>
                              <ul className="text-xs space-y-1">
                                {candidate.growthAreas.map((area, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <XCircleIcon className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <span>{area}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => window.location.href = `/candidates?id=${candidate.candidateId}`}
                    >
                      View Profile
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button
                onClick={getRecommendations}
                variant="outline"
                className="gap-2"
              >
                <SparklesIcon className="h-4 w-4" />
                Refresh Recommendations
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}