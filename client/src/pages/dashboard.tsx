import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OverviewCard } from "@/components/overview-card";
import { ApplicationStatusBadge } from "@/components/application-status-badge";
import { formatDate } from "@/lib/utils";
import { 
  Briefcase, 
  UserPlus, 
  Calendar, 
  Check, 
  ChevronRight, 
  SparklesIcon, 
  BarChart3Icon,
  MapPinIcon,
  BuildingIcon
} from "lucide-react";
import { Link } from "wouter";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Sector
} from "recharts";

export default function Dashboard() {
  // State for active pie chart sections
  const [activeLocationIndex, setActiveLocationIndex] = useState(-1);
  const [activePositionIndex, setActivePositionIndex] = useState(-1);
  
  // Fetch dashboard statistics
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch recent applications
  const { data: recentApplications = [], isLoading: isApplicationsLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-applications"],
  });
  
  // Prepare chart data with colors
  const LOCATION_COLORS = ['#0052CC', '#00B8D9', '#36B37E', '#6554C0', '#FF5630', '#FFAB00'];
  const POSITION_COLORS = ['#00875A', '#0052CC', '#6554C0', '#FF5630', '#FFAB00', '#253858'];
  
  const locationChartData = stats?.applicationsByLocation.map((item: any, index: number) => ({
    name: item.location || "Other",
    value: item.count,
    color: LOCATION_COLORS[index % LOCATION_COLORS.length]
  })) || [];
  
  const positionChartData = stats?.applicationsByPosition.map((item: any, index: number) => ({
    name: item.position || "Other",
    value: item.count,
    color: POSITION_COLORS[index % POSITION_COLORS.length]
  })) || [];
  
  // Custom renderer for active pie sector
  const renderActiveShape = (props: any) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props;
  
    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#172B4D" className="text-sm font-medium">
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#172B4D" className="text-xs">
          {value} ({(percent * 100).toFixed(0)}%)
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

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
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg leading-6 font-medium">Applications by Location</CardTitle>
            </div>
            <CardDescription className="pt-1 text-xs">
              Distribution of applications across different center locations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-72">
            {isStatsLoading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : locationChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No location data available</p>
              </div>
            ) : (
              <div className="h-full">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      activeIndex={activeLocationIndex}
                      activeShape={renderActiveShape}
                      data={locationChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActiveLocationIndex(index)}
                      onMouseLeave={() => setActiveLocationIndex(-1)}
                    >
                      {locationChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="#fff"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} applications`, 'Count']}
                      labelFormatter={(label) => `Location: ${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {locationChartData.map((entry, index) => (
                    <div 
                      key={`legend-${index}`} 
                      className="flex items-center text-xs"
                      onMouseEnter={() => setActiveLocationIndex(index)}
                      onMouseLeave={() => setActiveLocationIndex(-1)}
                    >
                      <div 
                        className="w-3 h-3 mr-2 rounded-sm" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="truncate">{entry.name}</span>
                      <span className="ml-1 text-gray-500">({entry.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applications by Position */}
        <Card className="shadow overflow-hidden">
          <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex items-center space-x-2">
              <BuildingIcon className="h-5 w-5 text-secondary" />
              <CardTitle className="text-lg leading-6 font-medium">Applications by Position</CardTitle>
            </div>
            <CardDescription className="pt-1 text-xs">
              Number of applications received for each job position
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-72">
            {isStatsLoading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : positionChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No position data available</p>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={positionChartData}
                      margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                    >
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        height={50}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                        formatter={(value) => [`${value} applications`, 'Count']}
                        labelFormatter={(label) => `Position: ${label}`}
                      />
                      <Bar 
                        dataKey="value" 
                        onMouseEnter={(_, index) => setActivePositionIndex(index)}
                        onMouseLeave={() => setActivePositionIndex(-1)}
                      >
                        {positionChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === activePositionIndex ? entry.color : `${entry.color}99`}
                            radius={[4, 4, 0, 0]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-3 space-y-3">
                  {positionChartData.map((item, index) => (
                    <div 
                      key={`position-${index}`} 
                      className="flex items-center text-xs"
                      onMouseEnter={() => setActivePositionIndex(index)}
                      onMouseLeave={() => setActivePositionIndex(-1)}
                    >
                      <div className="w-full">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium" style={{ color: item.color }}>{item.name}</span>
                          <span className="text-gray-500">{item.value} applications</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${Math.min(100, (item.value / Math.max(...positionChartData.map((d: any) => d.value))) * 100)}%`,
                              backgroundColor: index === activePositionIndex ? item.color : `${item.color}80`
                            }}
                          ></div>
                        </div>
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
