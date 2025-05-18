import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Users, Check, X, AlertCircle, Award } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useQuery } from '@tanstack/react-query';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { 
  RECRUITMENT_STAGES, 
  DB_STATUS_TO_STAGE, 
  STAGE_TO_DB_STATUS 
} from "./stage-context";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define recruitment stages matching our existing app stages
const STAGES = [
  { id: "applied", name: "New Applications", color: "bg-blue-100" },
  { id: "in_review", name: "Under Review", color: "bg-yellow-100" },
  { id: "interview", name: "Interview Stage", color: "bg-purple-100" },
  { id: "offered", name: "Offer Extended", color: "bg-pink-100" },
  { id: "hired", name: "Hired", color: "bg-green-100" }
];

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
    phone?: string;
    resumeUrl?: string;
    skills?: string;
    certifications?: string[];
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
  daysInStage?: number;
  priority?: 'high' | 'medium' | 'low';
  [key: string]: any;
}

interface DashboardStats {
  activeJobs: string;
  newApplications: string;
  interviews: string;
  filled: string;
  applicationsByLocation: Array<{ location: string; count: number }>;
  applicationsByPosition: Array<{ position: string; count: number }>;
  [key: string]: any;
}

export default function RecruiterDashboard() {
  // Filters and sorting
  const [filter, setFilter] = useState({ location: "all", role: "all" });
  const [sortBy, setSortBy] = useState('name');
  const [error, setError] = useState<string | null>(null);

  // Fetch applications data from the API
  const { data: applications = [], isLoading: isLoadingApplications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/applications");
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching applications:", error);
        return [];
      }
    }
  });

  // Fetch dashboard stats 
  const { data: stats = {} as DashboardStats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {} as DashboardStats;
      }
    }
  });

  // Calculate days in stage for each application
  const applicationsWithMetadata = useMemo(() => {
    return applications.map(app => {
      // Calculate days in stage (from updated date or created date if no status change)
      const updatedDate = new Date(app.updatedAt || app.createdAt);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate.getTime() - updatedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Assign priority based on days in stage and position
      let priority: 'high' | 'medium' | 'low' = 'medium';
      
      if (diffDays > 7) {
        priority = 'high';
      } else if (diffDays < 3) {
        priority = 'low';
      }
      
      // Leadership positions get higher priority
      if (app.jobPosting?.title?.toLowerCase().includes('director') || 
          app.jobPosting?.title?.toLowerCase().includes('lead')) {
        priority = 'high';
      }
      
      return {
        ...app,
        daysInStage: diffDays,
        priority
      };
    });
  }, [applications]);

  // Filter applications based on user selections
  const filteredApplications = useMemo(() => {
    return applicationsWithMetadata.filter(app => {
      if (filter.location !== "all" && app.jobPosting?.location?.name !== filter.location) return false;
      if (filter.role !== "all" && app.jobPosting?.title !== filter.role) return false;
      return true;
    });
  }, [applicationsWithMetadata, filter]);

  // Group applications by stage
  const applicationsByStage = useMemo(() => {
    return STAGES.reduce((acc, stage) => {
      acc[stage.id] = filteredApplications.filter(app => app.status === stage.id);
      return acc;
    }, {} as Record<string, Application[]>);
  }, [filteredApplications]);

  // Sort applications within each stage
  const sortedApplicationsByStage = useMemo(() => {
    return Object.entries(applicationsByStage).reduce((acc, [stageId, apps]) => {
      acc[stageId] = [...apps].sort((a, b) => {
        if (sortBy === 'name') return (a.candidate?.name || '').localeCompare(b.candidate?.name || '');
        if (sortBy === 'daysInStage') return (b.daysInStage || 0) - (a.daysInStage || 0);
        if (sortBy === 'priority') {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium'];
        }
        return 0;
      });
      return acc;
    }, {} as Record<string, Application[]>);
  }, [applicationsByStage, sortBy]);

  // Move candidate to a new stage
  const moveCandidate = async (appId: number, newStage: string) => {
    try {
      const url = `/api/applications/${appId}/status`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStage }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
    } catch (err) {
      setError('Failed to move candidate');
      console.error(err);
    }
  };

  // Handle drag-and-drop events
  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;

    if (sourceStage === destStage) {
      // Reordering within same stage - we don't need to update the server
      // This is just a visual reordering
    } else {
      // Move to a different stage - update on server
      try {
        const appId = parseInt(draggableId);
        if (!isNaN(appId)) {
          moveCandidate(appId, destStage);
        }
      } catch (err) {
        console.error("Error processing drag and drop:", err);
        setError("Failed to process drag and drop operation");
      }
    }
  };

  // Get unique locations for filter
  const locations = useMemo(() => {
    const locationSet = new Set<string>();
    applications.forEach(app => {
      if (app.jobPosting?.location?.name) {
        locationSet.add(app.jobPosting.location.name);
      }
    });
    return Array.from(locationSet);
  }, [applications]);

  // Get unique roles for filter
  const roles = useMemo(() => {
    const roleSet = new Set<string>();
    applications.forEach(app => {
      if (app.jobPosting?.title) {
        roleSet.add(app.jobPosting.title);
      }
    });
    return Array.from(roleSet);
  }, [applications]);

  // Chart data for applications by stage
  const chartData = {
    labels: STAGES.map(stage => stage.name),
    datasets: [
      {
        label: 'Candidates',
        data: STAGES.map(stage => applicationsByStage[stage.id]?.length || 0),
        backgroundColor: ["#bfdbfe", "#fef9c3", "#e9d5ff", "#fbcfe8", "#bbf7d0"],
        borderColor: ["#3b82f6", "#facc15", "#a855f7", "#ec4899", "#22c55e"],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Candidates"
        }
      },
      x: {
        title: {
          display: true,
          text: "Stage"
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: "Candidates by Recruitment Stage"
      }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 w-full">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recruitment Pipeline</h1>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Location Filter */}
          <div>
            <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <select
              id="location-filter"
              className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm p-2 text-sm"
              value={filter.location}
              onChange={(e) => setFilter({ ...filter, location: e.target.value })}
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              id="role-filter"
              className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm p-2 text-sm"
              value={filter.role}
              onChange={(e) => setFilter({ ...filter, role: e.target.value })}
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              id="sort-filter"
              className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm p-2 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="daysInStage">Days in Stage</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
              <Users size={20} className="text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Applications</p>
              <p className="text-xl font-bold dark:text-white">{stats.newApplications || "0"}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full mr-4">
              <Clock size={20} className="text-yellow-600 dark:text-yellow-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Jobs</p>
              <p className="text-xl font-bold dark:text-white">{stats.activeJobs || "0"}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
              <Check size={20} className="text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Interviews</p>
              <p className="text-xl font-bold dark:text-white">{stats.interviews || "0"}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4">
              <Award size={20} className="text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Positions Filled</p>
              <p className="text-xl font-bold dark:text-white">{stats.filled || "0"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm mb-6">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-wrap sm:flex-nowrap space-y-4 sm:space-y-0 sm:space-x-4 overflow-x-auto pb-4">
          {STAGES.map(stage => (
            <Droppable droppableId={stage.id} key={stage.id}>
              {(provided) => (
                <div className="w-full sm:w-64 flex-shrink-0" ref={provided.innerRef} {...provided.droppableProps}>
                  <div className={`${stage.color} dark:bg-opacity-20 px-3 py-2 rounded-t-lg flex justify-between items-center`}>
                    <h3 className="font-medium">{stage.name}</h3>
                    <span className="bg-white dark:bg-gray-800 text-sm py-1 px-2 rounded-full">
                      {sortedApplicationsByStage[stage.id]?.length || 0}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-b-lg shadow-sm h-96 overflow-y-auto p-2">
                    {sortedApplicationsByStage[stage.id]?.map((app, index) => (
                      <Draggable key={app.id} draggableId={app.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-gray-50 dark:bg-gray-800 rounded p-3 mb-2 border-l-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750"
                            style={{
                              borderLeftColor: app.priority === 'high' ? '#f87171' :
                                app.priority === 'medium' ? '#fbbf24' : '#60a5fa',
                              ...provided.draggableProps.style
                            }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium dark:text-white">{app.candidate?.name || "Unknown Candidate"}</h4>
                              <div className="flex">
                                <button
                                  onClick={() => {
                                    const currentIndex = STAGES.findIndex(s => s.id === app.status);
                                    if (currentIndex < STAGES.length - 1) {
                                      moveCandidate(app.id, STAGES[currentIndex + 1].id);
                                    }
                                  }}
                                  className="text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 p-1 rounded"
                                  aria-label={`Move ${app.candidate?.name || "candidate"} to next stage`}
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => moveCandidate(app.id, 'rejected')}
                                  className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 p-1 rounded ml-1"
                                  aria-label={`Reject ${app.candidate?.name || "candidate"}`}
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {app.jobPosting?.title || "Unknown Role"} • {app.jobPosting?.location?.name || "Unknown Location"}
                            </p>
                            
                            {app.candidate?.certifications && (
                              <div className="mt-2 flex space-x-1 flex-wrap">
                                {(typeof app.candidate.certifications === 'string' 
                                  ? [app.candidate.certifications] 
                                  : app.candidate.certifications).map((cert, i) => (
                                  <span key={i} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded mt-1">
                                    {cert}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {(app.daysInStage || 0) > 3 && (
                              <div className="mt-2 flex items-center text-amber-700 dark:text-amber-400 text-xs">
                                <AlertCircle size={12} className="mr-1" />
                                {app.daysInStage} days in stage
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {(!sortedApplicationsByStage[stage.id] || sortedApplicationsByStage[stage.id].length === 0) && (
                      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
                        No candidates in this stage
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}