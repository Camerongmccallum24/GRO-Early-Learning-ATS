import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightIcon, InfoIcon } from "lucide-react";

// Import our new funnel dashboard components
import { HiringFunnel, type FunnelStage } from "@/components/dashboard/funnel-chart";
import { StageMetrics, type StageMetric } from "@/components/dashboard/stage-metrics";
import { ApplicationsByCategory, type CategoryData } from "@/components/dashboard/applications-by-category";
import { ApplicationsTable, type ApplicationRowData } from "@/components/dashboard/applications-table";
import { 
  RECRUITMENT_STAGES, 
  DB_STATUS_TO_STAGE, 
  STAGE_TO_DB_STATUS 
} from "@/components/dashboard/stage-context";

// Custom colors for our stages
const STAGE_COLORS = {
  [RECRUITMENT_STAGES.POSTED]: "rgb(122, 162, 247)",
  [RECRUITMENT_STAGES.APPLIED]: "rgb(130, 115, 223)",
  [RECRUITMENT_STAGES.SCREENING]: "rgb(232, 145, 116)",
  [RECRUITMENT_STAGES.INTERVIEW]: "rgb(92, 124, 250)",
  [RECRUITMENT_STAGES.OFFER]: "rgb(75, 192, 192)",
  [RECRUITMENT_STAGES.HIRED]: "rgb(177, 200, 64)",
  [RECRUITMENT_STAGES.REJECTED]: "rgb(255, 99, 132)"
};

export default function Dashboard() {
  // For navigation with wouter
  const [, setLocation] = useLocation();
  
  // State for the selected stage in the funnel
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  // Define interfaces for the API response types
  interface DashboardStats {
    activeJobs: string;
    newApplications: string;
    interviews: string;
    filled: string;
    applicationsByLocation: Array<{ location: string; count: number }>;
    applicationsByPosition: Array<{ position: string; count: number }>;
    [key: string]: any;
  }

  interface Application {
    id: number;
    candidateId: number;
    jobPostingId: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    candidate?: {
      id: number;
      name: string;
      email: string;
      [key: string]: any;
    };
    jobPosting?: {
      id: number;
      title: string;
      location?: {
        id: number;
        name: string;
        [key: string]: any;
      };
      [key: string]: any;
    };
    [key: string]: any;
  }

  // Helper to convert UI stage to DB status for queries
  const getDBStatusFromStage = (stage: string | null): string | undefined => {
    if (!stage) return undefined;
    return stage in STAGE_TO_DB_STATUS
      ? STAGE_TO_DB_STATUS[stage as keyof typeof STAGE_TO_DB_STATUS]
      : undefined;
  };

  // Get the database status value for the selected stage
  const selectedDBStatus = useMemo(() => {
    if (!selectedStage) return undefined;
    
    // Type-safe lookup using the mapping object
    return selectedStage in STAGE_TO_DB_STATUS 
      ? STAGE_TO_DB_STATUS[selectedStage as keyof typeof STAGE_TO_DB_STATUS] 
      : undefined;
  }, [selectedStage]);

  // Fetch dashboard stats with proper typing and stage filtering
  const { data: stats = {} as DashboardStats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats", selectedDBStatus ? "status=" + selectedDBStatus : ""],
    queryFn: async ({ queryKey }) => {
      // Get the URL with optional status parameter
      const url = `${queryKey[0]}${queryKey[1] ? `?${queryKey[1]}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
  });

  // Fetch recent applications with proper typing and stage filtering
  const { data: recentApplications = [] as Application[], isLoading: isLoadingApplications } = useQuery<Application[]>({
    queryKey: ["/api/dashboard/recent-applications", selectedDBStatus ? "status=" + selectedDBStatus : ""],
    queryFn: async ({ queryKey }) => {
      // Get the URL with optional status parameter
      const url = `${queryKey[0]}${queryKey[1] ? `?${queryKey[1]}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
  });

  // Create funnel data from stats
  const funnelData: FunnelStage[] = useMemo(() => {
    // We'll create mock funnel data based on the existing stats
    // In a real implementation, this would come from the API with actual conversion rates

    // Set some reasonable values based on available stats
    const activeJobs = parseInt(stats.activeJobs || "0");
    const newApplications = parseInt(stats.newApplications || "0");
    const interviews = parseInt(stats.interviews || "0");
    const filled = parseInt(stats.filled || "0");
    
    // Derive reasonable numbers for screening and offers
    const screening = Math.round(newApplications * 0.65);
    const offers = Math.round(interviews * 0.70);

    // Calculate conversion rates
    const appliedConversion = activeJobs > 0 ? newApplications / activeJobs : 0;
    const screeningConversion = newApplications > 0 ? screening / newApplications : 0;
    const interviewConversion = screening > 0 ? interviews / screening : 0;
    const offerConversion = interviews > 0 ? offers / interviews : 0;
    const hiredConversion = offers > 0 ? filled / offers : 0;

    return [
      {
        name: RECRUITMENT_STAGES.POSTED,
        value: activeJobs,
        count: activeJobs,
        conversion: 1, // 100% as this is the first stage
        color: STAGE_COLORS[RECRUITMENT_STAGES.POSTED]
      },
      {
        name: RECRUITMENT_STAGES.APPLIED,
        value: newApplications,
        count: newApplications,
        conversion: appliedConversion,
        color: STAGE_COLORS[RECRUITMENT_STAGES.APPLIED]
      },
      {
        name: RECRUITMENT_STAGES.SCREENING,
        value: screening,
        count: screening,
        conversion: screeningConversion,
        color: STAGE_COLORS[RECRUITMENT_STAGES.SCREENING]
      },
      {
        name: RECRUITMENT_STAGES.INTERVIEW,
        value: interviews,
        count: interviews,
        conversion: interviewConversion,
        color: STAGE_COLORS[RECRUITMENT_STAGES.INTERVIEW]
      },
      {
        name: RECRUITMENT_STAGES.OFFER,
        value: offers,
        count: offers,
        conversion: offerConversion,
        color: STAGE_COLORS[RECRUITMENT_STAGES.OFFER]
      },
      {
        name: RECRUITMENT_STAGES.HIRED,
        value: filled,
        count: filled,
        conversion: hiredConversion,
        color: STAGE_COLORS[RECRUITMENT_STAGES.HIRED]
      }
    ];
  }, [stats]);

  // Create stage metrics
  const stageMetrics: StageMetric[] = useMemo(() => {
    return [
      {
        id: "posted",
        label: "Posted Jobs",
        value: parseInt(stats.activeJobs || "0"),
        stage: RECRUITMENT_STAGES.POSTED,
        color: STAGE_COLORS[RECRUITMENT_STAGES.POSTED]
      },
      {
        id: "applied",
        label: "New Applications",
        value: parseInt(stats.newApplications || "0"),
        stage: RECRUITMENT_STAGES.APPLIED,
        color: STAGE_COLORS[RECRUITMENT_STAGES.APPLIED]
      },
      {
        id: "screening",
        label: "In Screening",
        value: Math.round(parseInt(stats.newApplications || "0") * 0.65),
        stage: RECRUITMENT_STAGES.SCREENING,
        color: STAGE_COLORS[RECRUITMENT_STAGES.SCREENING]
      },
      {
        id: "hired",
        label: "Positions Filled",
        value: parseInt(stats.filled || "0"),
        stage: RECRUITMENT_STAGES.HIRED,
        color: STAGE_COLORS[RECRUITMENT_STAGES.HIRED]
      }
    ];
  }, [stats]);

  // Create location data
  const locationData: CategoryData[] = useMemo(() => {
    if (!stats.applicationsByLocation) {
      return [];
    }

    try {
      const rawData = Array.isArray(stats.applicationsByLocation) 
        ? stats.applicationsByLocation 
        : JSON.parse(stats.applicationsByLocation as string);
      
      return rawData.map((item: any) => ({
        name: item.location || "Unknown",
        value: item.count,
        color: "#87b6ad" // Using brand color
      }));
    } catch (e) {
      console.error("Failed to parse location data:", e);
      return [];
    }
  }, [stats]);

  // Create position data
  const positionData: CategoryData[] = useMemo(() => {
    if (!stats.applicationsByPosition) {
      return [];
    }

    try {
      const rawData = Array.isArray(stats.applicationsByPosition) 
        ? stats.applicationsByPosition 
        : JSON.parse(stats.applicationsByPosition as string);
      
      return rawData.map((item: any) => ({
        name: item.position || "Unknown",
        value: item.count,
        color: "#e89174" // Using brand color
      }));
    } catch (e) {
      console.error("Failed to parse position data:", e);
      return [];
    }
  }, [stats]);

  // Map database status to our funnel stages using the imported mapping
  const mapStatusToStage = (status: string): string => {
    // Convert to lowercase for case-insensitive comparison
    const statusLower = status.toLowerCase();
    
    // Use our mapping from stage-context
    // Type-safe lookup
    const validStatuses = Object.keys(DB_STATUS_TO_STAGE);
    if (validStatuses.includes(statusLower)) {
      return DB_STATUS_TO_STAGE[statusLower as keyof typeof DB_STATUS_TO_STAGE];
    }
    
    // Default to Applied if no matching status
    return RECRUITMENT_STAGES.APPLIED;
  };

  // Format applications for the table
  const applications: ApplicationRowData[] = useMemo(() => {
    if (!recentApplications.length) {
      return [];
    }

    return recentApplications.map((app: any) => ({
      id: app.id,
      candidateName: app.candidate?.name || "Unknown Candidate",
      position: app.jobPosting?.title || "Unknown Position",
      stage: mapStatusToStage(app.status || "applied"),
      date: app.application_date || app.createdAt,
      location: app.jobPosting?.location?.name
    }));
  }, [recentApplications]);

  // Handle stage selection
  const handleStageClick = (stage: string) => {
    setSelectedStage(prev => prev === stage ? null : stage);
  };

  // Reset stage filter
  const resetStageFilter = () => {
    setSelectedStage(null);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with conditional stage filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recruiting Dashboard</h1>
          <p className="text-muted-foreground">
            {selectedStage 
              ? `Viewing metrics for ${selectedStage} stage` 
              : "Overview of your recruiting pipeline and metrics"}
          </p>
        </div>
        
        {selectedStage && (
          <Button 
            variant="outline" 
            className="mt-2 sm:mt-0"
            onClick={resetStageFilter}
          >
            Clear Stage Filter
          </Button>
        )}
      </div>

      {/* Funnel Visualization */}
      <HiringFunnel 
        data={funnelData} 
        onStageClick={handleStageClick}
        selectedStage={selectedStage || undefined}
      />

      {/* Stage Metrics */}
      <StageMetrics 
        metrics={stageMetrics} 
        selectedStage={selectedStage || undefined}
        onStageClick={handleStageClick}
      />

      {/* Applications and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ApplicationsTable 
          data={applications}
          selectedStage={selectedStage}
          title={selectedStage ? `Applications (${selectedStage})` : "Recent Applications"}
        />
        
        <Tabs defaultValue="location" className="w-full">
          <div className="flex justify-between items-center mb-2">
            <TabsList>
              <TabsTrigger value="location">By Location</TabsTrigger>
              <TabsTrigger value="position">By Position</TabsTrigger>
            </TabsList>
            
            {selectedStage && (
              <div className="text-xs text-gray-500 flex items-center">
                <InfoIcon size={12} className="mr-1" />
                Showing data for {selectedStage} stage
              </div>
            )}
          </div>
          
          <TabsContent value="location" className="m-0">
            <ApplicationsByCategory
              title="Applications by Location"
              data={locationData}
              selectedStage={selectedStage || undefined}
            />
          </TabsContent>
          
          <TabsContent value="position" className="m-0">
            <ApplicationsByCategory
              title="Applications by Position"
              data={positionData}
              selectedStage={selectedStage || undefined}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Actions Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button 
            className="w-full justify-between bg-[#e89174] hover:bg-[#d8755b]"
            onClick={() => setLocation('/jobs/new')}
          >
            <span>Post New Job</span>
            <ArrowRightIcon size={16} />
          </Button>
          <Button 
            className="w-full justify-between bg-[#b1c840] hover:bg-[#9eb33a]"
            onClick={() => setLocation('/applications?status=applied')}
          >
            <span>Review New Applications</span>
            <ArrowRightIcon size={16} />
          </Button>
          <Button 
            className="w-full justify-between bg-[#7356ff] hover:bg-[#634ad9]"
            onClick={() => setLocation('/interviews/schedule')}
          >
            <span>Schedule Interviews</span>
            <ArrowRightIcon size={16} />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}