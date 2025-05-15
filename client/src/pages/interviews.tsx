import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Calendar, Video, Users, CalendarClock, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Sidebar from '@/components/sidebar';
import PageHeader from '@/components/page-header';

const Interviews = () => {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch interviews
  const { data: interviews, isLoading } = useQuery({
    queryKey: ['/api/interviews'],
  });

  // Handle filtering
  const filteredInterviews = interviews?.filter((interview: any) => {
    if (statusFilter !== 'all' && interview.status !== statusFilter) {
      return false;
    }
    if (typeFilter !== 'all' && interview.interviewType !== typeFilter) {
      return false;
    }
    return true;
  });

  // Group interviews by date
  const groupedInterviews = filteredInterviews?.reduce((acc: any, interview: any) => {
    const date = format(new Date(interview.scheduledDate), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(interview);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = groupedInterviews ? Object.keys(groupedInterviews).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  }) : [];

  // Handle new interview button click
  const handleNewInterview = () => {
    setLocation('/applications');
  };

  // Render interview status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Completed</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Canceled</Badge>;
      case 'no_show':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Render interview type badge
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case 'video':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1">
          <Video className="h-3 w-3" /> Video
        </Badge>;
      case 'in_person':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
          <Users className="h-3 w-3" /> In-Person
        </Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center">
          <PageHeader 
            title="Interviews" 
            description="Manage and schedule candidate interviews"
          />
          <Button onClick={handleNewInterview} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Schedule Interview
          </Button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <div className="min-w-[200px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[200px]">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="in_person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for upcoming/past interviews */}
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" /> Past
              </TabsTrigger>
            </TabsList>
            
            {/* Upcoming Interviews */}
            <TabsContent value="upcoming">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sortedDates.length > 0 ? (
                <div className="space-y-6 mt-4">
                  {sortedDates
                    .filter(date => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)))
                    .map(date => (
                      <Card key={date}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">
                            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                          </CardTitle>
                          <CardDescription>
                            {groupedInterviews[date].length} interview{groupedInterviews[date].length !== 1 ? 's' : ''}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {groupedInterviews[date].map((interview: any) => (
                                <TableRow key={interview.id}>
                                  <TableCell className="font-medium">
                                    {format(new Date(interview.scheduledDate), 'h:mm a')} - 
                                    {format(new Date(new Date(interview.scheduledDate).getTime() + (interview.duration * 60000)), 'h:mm a')}
                                  </TableCell>
                                  <TableCell>{interview.application?.candidate?.name || 'Unknown'}</TableCell>
                                  <TableCell>{interview.application?.jobPosting?.title || 'Unknown'}</TableCell>
                                  <TableCell>{renderTypeBadge(interview.interviewType)}</TableCell>
                                  <TableCell>{renderStatusBadge(interview.status)}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setLocation(`/interviews/${interview.id}`)}
                                      >
                                        View
                                      </Button>
                                      {interview.videoLink && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => window.open(interview.videoLink, '_blank')}
                                          className="flex items-center gap-1"
                                        >
                                          <Video className="h-3 w-3" /> Join
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-muted/20 rounded-lg mt-4">
                  <h3 className="text-lg font-medium">No upcoming interviews</h3>
                  <p className="text-muted-foreground mt-1">Schedule a new interview to get started</p>
                  <Button onClick={handleNewInterview} className="mt-4">
                    Schedule Interview
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Past Interviews */}
            <TabsContent value="past">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sortedDates
                  .filter(date => new Date(date) < new Date(new Date().setHours(0, 0, 0, 0)))
                  .length > 0 ? (
                <div className="space-y-6 mt-4">
                  {sortedDates
                    .filter(date => new Date(date) < new Date(new Date().setHours(0, 0, 0, 0)))
                    .map(date => (
                      <Card key={date}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">
                            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                          </CardTitle>
                          <CardDescription>
                            {groupedInterviews[date].length} interview{groupedInterviews[date].length !== 1 ? 's' : ''}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {groupedInterviews[date].map((interview: any) => (
                                <TableRow key={interview.id}>
                                  <TableCell className="font-medium">
                                    {format(new Date(interview.scheduledDate), 'h:mm a')} - 
                                    {format(new Date(new Date(interview.scheduledDate).getTime() + (interview.duration * 60000)), 'h:mm a')}
                                  </TableCell>
                                  <TableCell>{interview.application?.candidate?.name || 'Unknown'}</TableCell>
                                  <TableCell>{interview.application?.jobPosting?.title || 'Unknown'}</TableCell>
                                  <TableCell>{renderTypeBadge(interview.interviewType)}</TableCell>
                                  <TableCell>{renderStatusBadge(interview.status)}</TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setLocation(`/interviews/${interview.id}`)}
                                    >
                                      View
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-muted/20 rounded-lg mt-4">
                  <h3 className="text-lg font-medium">No past interviews</h3>
                  <p className="text-muted-foreground mt-1">Past interviews will appear here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Interviews;