import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Radar } from "recharts";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { 
  SparklesIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  Loader2Icon,
  MoveUpIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  GraduationCapIcon,
  HeartHandshakeIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CandidateMatchProfileProps {
  candidateId: number;
  candidateName: string;
  compact?: boolean;
}

interface MatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  comments: string;
  candidateName: string;
  jobTitle: string;
  jobLocation?: string;
}

export function CandidateMatchProfile({ candidateId, candidateName, compact = false }: CandidateMatchProfileProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch available job postings
  const { data: jobPostings, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["/api/job-postings"],
    retry: false
  });
  
  // Set the first job as default when jobs are loaded
  useEffect(() => {
    if (jobPostings?.length > 0 && !selectedJobId) {
      setSelectedJobId(String(jobPostings[0].id));
    }
  }, [jobPostings, selectedJobId]);
  
  // Fetch match data when a job is selected
  const { 
    data: matchData, 
    isLoading: isLoadingMatch, 
    error: matchError,
    refetch: refetchMatch
  } = useQuery({
    queryKey: ["/api/candidates", candidateId, "match", selectedJobId],
    enabled: !!selectedJobId,
    retry: false
  });
  
  // Format data for radar chart
  const getRadarData = (match: MatchResult) => {
    // Calculate scores for different domains based on matched skills and score
    return [
      {
        subject: "Qualifications",
        A: calculateDomainScore(match, ["certification", "qualification", "degree", "education"]),
        fullMark: 100,
      },
      {
        subject: "Experience",
        A: calculateDomainScore(match, ["experience", "years", "history", "background"]),
        fullMark: 100,
      },
      {
        subject: "Technical Skills",
        A: calculateDomainScore(match, ["skill", "technical", "program", "system"]),
        fullMark: 100,
      },
      {
        subject: "Soft Skills",
        A: calculateDomainScore(match, ["communication", "teamwork", "leadership", "interpersonal"]),
        fullMark: 100,
      },
      {
        subject: "Cultural Fit",
        A: calculateDomainScore(match, ["culture", "values", "community", "care"]),
        fullMark: 100,
      },
    ];
  };
  
  // Helper to calculate a score for each domain
  const calculateDomainScore = (match: MatchResult, keywords: string[]) => {
    if (!match) return 50;
    
    let score = match.score * 0.5; // Base score is half of the overall match
    
    // Safely handle undefined or null arrays
    const matchedSkills = match.matchedSkills || [];
    const missingSkills = match.missingSkills || [];
    
    // Count matching skills that contain any of the keywords
    const relevantMatches = matchedSkills.filter(skill => 
      keywords.some(keyword => skill.toLowerCase().includes(keyword.toLowerCase()))
    ).length;
    
    // Count missing skills that contain any of the keywords
    const relevantMissing = missingSkills.filter(skill => 
      keywords.some(keyword => skill.toLowerCase().includes(keyword.toLowerCase()))
    ).length;
    
    // Adjust score based on relevant matches and missing skills
    if (relevantMatches + relevantMissing > 0) {
      const adjustedScore = (relevantMatches / (relevantMatches + relevantMissing)) * 50;
      score += adjustedScore;
    } else {
      score += 25; // Middle ground if no relevant skills found
    }
    
    return Math.min(Math.max(score, 0), 100); // Ensure score is between 0-100
  };
  
  // Function to get appropriate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 75) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (score >= 60) return "bg-blue-100 text-blue-800 border-blue-300";
    if (score >= 45) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-rose-100 text-rose-800 border-rose-300";
  };
  
  // Function to get score rating label
  const getScoreRating = (score: number) => {
    if (score >= 90) return "Excellent Match";
    if (score >= 75) return "Strong Match";
    if (score >= 60) return "Good Match";
    if (score >= 45) return "Moderate Match";
    return "Low Match";
  };
  
  // Format skill icon and name
  const renderSkill = (skill: string, matched: boolean) => {
    return (
      <div 
        key={skill} 
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${
          matched 
            ? "bg-green-50 text-green-700 border-green-200" 
            : "bg-amber-50 text-amber-700 border-amber-200"
        }`}
      >
        {matched ? (
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
        ) : (
          <XCircleIcon className="h-4 w-4 text-amber-600" />
        )}
        <span className="truncate">{skill}</span>
      </div>
    );
  };
  
  const handleRefresh = () => {
    refetchMatch();
    toast({
      title: "Refreshing match analysis",
      description: "Getting the latest AI-powered match data...",
    });
  };
  
  return (
    <Card className={`overflow-hidden border-primary/20 ${compact ? '' : 'mt-6'}`}>
      <CardHeader className={`bg-primary/5 flex flex-row items-center gap-2 ${compact ? 'py-2 px-3' : ''}`}>
        <div className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} rounded-full bg-primary/10 flex items-center justify-center`}>
          <SparklesIcon className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-primary`} />
        </div>
        <div>
          <CardTitle className={compact ? "text-sm" : "text-xl"}>AI-Powered Match Analysis</CardTitle>
          {!compact && (
            <CardDescription>
              See how well this candidate matches different positions using AI qualification analysis
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className={compact ? "py-2 px-3" : "pt-6"}>
        <div className={`flex flex-col ${compact ? 'gap-2' : 'md:flex-row gap-4 mb-6'} items-start`}>
          <div className={`w-full ${compact ? '' : 'md:w-64'}`}>
            <h3 className={`${compact ? 'text-xs' : 'text-sm'} font-medium ${compact ? 'mb-1' : 'mb-2'}`}>Select Position to Analyze</h3>
            {isLoadingJobs ? (
              <Skeleton className={`${compact ? 'h-7' : 'h-10'} w-full`} />
            ) : (
              <Select 
                value={selectedJobId || ""} 
                onValueChange={setSelectedJobId}
                disabled={isLoadingJobs}
              >
                <SelectTrigger className={`w-full ${compact ? 'h-7 text-xs' : ''}`}>
                  <SelectValue placeholder={compact ? "Select job" : "Select a job position"} />
                </SelectTrigger>
                <SelectContent>
                  {jobPostings?.map((job: any) => (
                    <SelectItem key={job.id} value={String(job.id)} className={compact ? "text-xs" : ""}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <Button 
            variant="outline" 
            className={`gap-1 ${compact ? 'h-7 text-xs py-0 px-2' : 'gap-2'}`}
            onClick={handleRefresh}
            disabled={!selectedJobId || isLoadingMatch}
          >
            {isLoadingMatch ? (
              <>
                <Loader2Icon className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} />
                {compact ? "Analyzing..." : "Analyzing..."}
              </>
            ) : (
              <>
                <SparklesIcon className={compact ? "h-3 w-3" : "h-4 w-4"} />
                {compact ? "Analyze" : "Refresh Analysis"}
              </>
            )}
          </Button>
        </div>
        
        {isLoadingMatch && selectedJobId ? (
          <div className={`${compact ? 'py-3' : 'py-8'} flex flex-col items-center justify-center`}>
            <Loader2Icon className={`${compact ? 'h-5 w-5 mb-1' : 'h-8 w-8 mb-2'} text-primary animate-spin`} />
            <p className={`text-muted-foreground ${compact ? 'text-xs' : ''}`}>Analyzing candidate qualifications...</p>
          </div>
        ) : matchError ? (
          <div className={`${compact ? 'py-3' : 'py-8'} text-center`}>
            <XCircleIcon className={`${compact ? 'h-5 w-5 mb-1' : 'h-8 w-8 mb-2'} text-destructive mx-auto`} />
            <h3 className={`font-medium ${compact ? 'text-sm' : 'text-lg'}`}>Analysis Error</h3>
            <p className={`text-muted-foreground ${compact ? 'text-xs mb-2' : 'mb-4'}`}>
              {(matchError as Error)?.message || "Failed to analyze candidate match"}
            </p>
            <Button variant="outline" onClick={handleRefresh} className={compact ? 'text-xs h-7 py-0' : ''}>Try Again</Button>
          </div>
        ) : !matchData && !selectedJobId ? (
          <div className={`${compact ? 'py-3' : 'py-8'} text-center`}>
            <SparklesIcon className={`${compact ? 'h-5 w-5 mb-1' : 'h-8 w-8 mb-2'} text-primary/40 mx-auto`} />
            <h3 className={`font-medium ${compact ? 'text-sm' : 'text-lg'}`}>Select a Position</h3>
            <p className={`text-muted-foreground ${compact ? 'text-xs' : ''}`}>
              Choose a job position to analyze this candidate's qualifications
            </p>
          </div>
        ) : matchData && selectedJobId ? (
          <div className={`${compact ? 'space-y-3' : 'space-y-6'}`}>
            <div className={`flex flex-col ${compact ? 'gap-2' : 'md:flex-row gap-4'} items-center`}>
              <div className="flex-1">
                <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-medium ${compact ? 'mb-0.5' : 'mb-1'} flex items-center gap-1`}>
                  <BriefcaseIcon className={`${compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} text-muted-foreground`} />
                  {matchData.jobTitle}
                  {matchData.jobLocation && !compact && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({matchData.jobLocation})
                    </span>
                  )}
                </h3>
                
                {!compact && (
                  <p className="text-muted-foreground text-sm mb-3">{matchData.comments}</p>
                )}
                
                <div className="flex items-center gap-2">
                  <div className={`${compact ? 'px-2 py-1 text-xs' : 'px-4 py-2'} rounded-full border font-medium ${getScoreColor(matchData.score)}`}>
                    {matchData.score}% Match
                  </div>
                  <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium`}>{getScoreRating(matchData.score)}</span>
                </div>
              </div>
              
              <div className={`${compact ? 'h-32 w-full' : 'h-48 w-full md:w-64'} flex-shrink-0`}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius={compact ? "70%" : "80%"} data={getRadarData(matchData)}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ 
                        fill: '#64748b', 
                        fontSize: compact ? 8 : 11,
                      }} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ 
                        fill: '#64748b',
                        fontSize: compact ? 8 : 11,
                      }}
                      tickCount={compact ? 3 : 5}
                    />
                    <Radar
                      name="Skills"
                      dataKey="A"
                      stroke="#bcd7d0"
                      fill="#bcd7d0"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {compact ? (
              <div className="space-y-2">
                <div className="bg-gray-50 p-2 rounded-md">
                  <div className="grid grid-cols-2 gap-1 mb-1">
                    <div>
                      <p className="text-[10px] font-medium">Skills Match</p>
                      <div className="flex items-center gap-1">
                        <progress className="w-full h-1" value={getRadarData(matchData)[2].A} max="100" />
                        <span className="text-[10px]">{getRadarData(matchData)[2].A.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium">Experience</p>
                      <div className="flex items-center gap-1">
                        <progress className="w-full h-1" value={getRadarData(matchData)[1].A} max="100" />
                        <span className="text-[10px]">{getRadarData(matchData)[1].A.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="skills" className="w-full">
                <TabsList>
                  <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
                  <TabsTrigger value="qualifications">Qualification Breakdown</TabsTrigger>
                </TabsList>
                
                <TabsContent value="skills" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        Matched Skills ({matchData.matchedSkills ? matchData.matchedSkills.length : 0})
                      </h4>
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md min-h-[100px]">
                        {matchData.matchedSkills && matchData.matchedSkills.length > 0 ? (
                          matchData.matchedSkills.map(skill => renderSkill(skill, true))
                        ) : (
                          <p className="text-sm text-muted-foreground">No matched skills identified</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                        <XCircleIcon className="h-4 w-4 text-amber-600" />
                        Missing Skills ({matchData.missingSkills ? matchData.missingSkills.length : 0})
                      </h4>
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md min-h-[100px]">
                        {matchData.missingSkills && matchData.missingSkills.length > 0 ? (
                          matchData.missingSkills.map(skill => renderSkill(skill, false))
                        ) : (
                          <p className="text-sm text-muted-foreground">No missing skills identified</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="qualifications" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Education & Certifications */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-1.5">
                        <GraduationCapIcon className="h-4 w-4 text-primary" />
                        Education & Certifications
                      </h4>
                      <div className="p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Qualification Match</span>
                          <span className="text-sm font-medium">
                            {getRadarData(matchData)[0].A.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={getRadarData(matchData)[0].A} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Analysis of educational background and certifications compared to job requirements.
                        </p>
                      </div>
                    </div>
                    
                    {/* Experience */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-1.5">
                        <TrendingUpIcon className="h-4 w-4 text-blue-600" />
                        Experience
                      </h4>
                      <div className="p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Experience Match</span>
                          <span className="text-sm font-medium">
                            {getRadarData(matchData)[1].A.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={getRadarData(matchData)[1].A} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Evaluation of relevant work history and professional experience for this role.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        ) : (
          <div className={`${compact ? 'py-3' : 'py-8'} text-center`}>
            <SparklesIcon className={`${compact ? 'h-5 w-5 mb-1' : 'h-8 w-8 mb-2'} text-primary/40 mx-auto`} />
            <h3 className={`font-medium ${compact ? 'text-sm' : 'text-lg'}`}>No Analysis Available</h3>
            <p className={`text-muted-foreground ${compact ? 'text-xs mb-2' : 'mb-4'}`}>
              Unable to generate a match analysis at this time
            </p>
            <Button variant="outline" onClick={handleRefresh} className={compact ? 'text-xs h-7 py-0' : ''}>Try Again</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}