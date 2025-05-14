import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OverviewCard } from "@/components/overview-card";
import { ApplicationStatusBadge } from "@/components/application-status-badge";
import { formatDate } from "@/lib/utils";
import { Briefcase, UserPlus, Calendar, Check, ChevronRight, SparklesIcon, BarChart3Icon } from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  // Fetch dashboard statistics
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch recent applications
  const { data: recentApplications = [], isLoading: isApplicationsLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-applications"],
  });
  
  const locationChartData = stats?.applicationsByLocation.map((item: any) => ({
    name: item.location || "Other",
    value: item.count,
  })) || [];
  
  const positionChartData = stats?.applicationsByPosition.map((item: any) => ({
    name: item.position || "Other",
    value: item.count,
  })) || [];

  return (
    <div className="space-y-6 p-4 md:p-6 pb-16">
      {/* Page Title (only visible on desktop) */}
      <div className="bg-white border-b border-gray-200 md:flex md:items-center md:justify-between p-4 md:py-2 md:px-6 md:h-16 hidden">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium leading-6 text-[#172B4D]">Dashboard</h1>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard
          title="Active Job Postings"
          value={isStatsLoading ? "..." : stats?.activeJobs || 0}
          icon={<Briefcase className="h-5 w-5 text-white" />}
          iconBgColor="bg-primary"
          linkTo="/jobs"
        />
        
        <OverviewCard
          title="New Applications"
          value={isStatsLoading ? "..." : stats?.newApplications || 0}
          icon={<UserPlus className="h-5 w-5 text-white" />}
          iconBgColor="bg-secondary"
          linkTo="/applications"
        />
        
        <OverviewCard
          title="Interviews Scheduled"
          value={isStatsLoading ? "..." : stats?.interviews || 0}
          icon={<Calendar className="h-5 w-5 text-white" />}
          iconBgColor="bg-blue-400"
          linkTo="/applications?status=interview"
        />
        
        <OverviewCard
          title="Positions Filled"
          value={isStatsLoading ? "..." : stats?.filled || 0}
          icon={<Check className="h-5 w-5 text-white" />}
          iconBgColor="bg-[#FF5630]"
          linkTo="/applications?status=hired"
        />
      </div>
      
      {/* AI-Powered Candidate Matching Insights Card */}
      <Card className="relative overflow-hidden border-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <SparklesIcon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg leading-6 font-medium">AI-Powered Candidate Matching</CardTitle>
          </div>
          <CardDescription>
            Intelligent matching technology helps you find the perfect candidates for your open positions
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm">Candidate Fit Analysis</h3>
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="h-3 w-3 text-emerald-600" />
                </div>
              </div>
              <p className="text-gray-600 text-xs mb-3">
                Analyze how well candidates match your job requirements with detailed skill breakdowns
              </p>
              <Link href="/candidates" className="text-primary text-xs font-medium flex items-center">
                View Candidates
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm">Smart Recommendations</h3>
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserPlus className="h-3 w-3 text-blue-600" />
                </div>
              </div>
              <p className="text-gray-600 text-xs mb-3">
                Get intelligent recommendations for candidates that best match your job requirements
              </p>
              <Link href="/jobs" className="text-primary text-xs font-medium flex items-center">
                View Job Postings
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm">Qualification Analysis</h3>
                <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <BarChart3Icon className="h-3 w-3 text-amber-600" />
                </div>
              </div>
              <p className="text-gray-600 text-xs mb-3">
                Visual breakdown of candidate qualifications across key domains like skills and experience
              </p>
              <Link href="/applications" className="text-primary text-xs font-medium flex items-center">
                View Applications
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card className="shadow overflow-hidden">
        <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
          <CardTitle className="text-lg leading-6 font-medium">Recent Applications</CardTitle>
          <Link href="/applications" className="text-sm text-primary hover:text-blue-700">
            View all
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Candidate</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Position</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Applied</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isApplicationsLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    Loading recent applications...
                  </td>
                </tr>
              ) : recentApplications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    No recent applications found
                  </td>
                </tr>
              ) : (
                recentApplications.map((application: any) => (
                  <tr 
                    key={application.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      window.location.href = `/applications?id=${application.id}`;
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <div className="text-gray-600 font-medium">
                            {application.candidate?.name?.charAt(0) || "?"}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.candidate?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.candidate?.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.jobPosting?.title || "Unknown Position"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.jobPosting?.location?.name || "Unknown Location"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ApplicationStatusBadge status={application.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(application.applicationDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Applications by Location */}
        <Card className="shadow overflow-hidden">
          <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <CardTitle className="text-lg leading-6 font-medium">Applications by Location</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-64">
            {isStatsLoading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : locationChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No location data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={locationChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0052CC" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Applications by Position */}
        <Card className="shadow overflow-hidden">
          <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <CardTitle className="text-lg leading-6 font-medium">Applications by Position</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-64">
            {isStatsLoading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : positionChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No position data available</p>
              </div>
            ) : (
              <div className="w-full h-full">
                <div className="w-full h-full flex flex-col justify-center space-y-4">
                  {positionChartData.map((item: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className="flex-1 mr-4">
                        <p className="text-sm text-gray-900">{item.name}</p>
                      </div>
                      <div className="w-1/2 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (item.value / Math.max(...positionChartData.map((d: any) => d.value))) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="ml-4 w-8 text-right">
                        <p className="text-sm text-gray-500">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
