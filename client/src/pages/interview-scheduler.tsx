import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, addDays, startOfDay, isValid } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarDays, VideoIcon, UserCheck, MapPin, ClipboardList } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Using user data directly from API
// import { useAuth } from '@/hooks/use-auth';
import { queryClient } from '@/lib/queryClient';
import { Sidebar } from '@/components/sidebar';
import PageHeader from '@/components/page-header';

const InterviewScheduler = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const applicationId = id && !isNaN(parseInt(id)) ? parseInt(id) : undefined; // Validate applicationId
  
  // Get current user data
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Form state
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [duration, setDuration] = useState<string>('60');
  const [interviewType, setInterviewType] = useState<string>('video');
  const [location, setLocation2] = useState<string>('');
  const [interviewerEmail, setInterviewerEmail] = useState<string>(user?.email || '');
  const [notes, setNotes] = useState<string>('');
  const [recordingPermission, setRecordingPermission] = useState<boolean>(false);

  // Get application details
  const { data: application, isLoading: isLoadingApplication } = useQuery({
    queryKey: ['/api/applications', applicationId],
    enabled: !!applicationId,
  });

  // Get available time slots
  const { data: availableSlots, isLoading: isLoadingSlots, refetch: refetchSlots } = useQuery({
    queryKey: ['/api/calendar/available-slots', date ? format(date, 'yyyy-MM-dd') : ''],
    enabled: !!date && isValid(date),
  });

  // Schedule interview mutation
  const scheduleMutation = useMutation({
    mutationFn: async (interviewData: any) => {
      const response = await fetch(`/api/applications/${applicationId}/schedule-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interviewData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to schedule interview');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Interview scheduled',
        description: 'The interview has been scheduled successfully!',
      });
      
      // Invalidate queries and redirect
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      setLocation('/interviews');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update available slots when date changes
  useEffect(() => {
    if (date) {
      refetchSlots();
      setTimeSlot('');
    }
  }, [date, refetchSlots]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!applicationId) {
      toast({
        title: 'Error',
        description: 'Application ID is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!date || !timeSlot) {
      toast({
        title: 'Error',
        description: 'Please select a date and time for the interview',
        variant: 'destructive',
      });
      return;
    }

    // Parse the time and create a datetime
    const [hours, minutes] = timeSlot.split(':');
    const scheduledDate = new Date(date);
    scheduledDate.setHours(parseInt(hours, 10));
    scheduledDate.setMinutes(parseInt(minutes, 10));
    
    const interviewData = {
      scheduledDate: scheduledDate.toISOString(),
      duration,
      interviewType,
      location: location || (interviewType === 'video' ? undefined : 'GRO Early Learning Office'),
      notes,
      recordingPermission,
      interviewerEmail: interviewerEmail || user?.email,
    };
    
    scheduleMutation.mutate(interviewData);
  };

  if (isLoadingApplication) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!applicationId || !application) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Application not found</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation('/applications')}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const formatTimeSlot = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <PageHeader 
          title="Schedule Interview" 
          description={`Schedule an interview for ${application.candidate?.name || 'Candidate'} - ${application.jobPosting?.title || 'Position'}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Left column - Calendar */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                <span>Select Date</span>
              </CardTitle>
              <CardDescription>Choose a date for the interview</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={{ before: startOfDay(new Date()) }}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Middle column - Time slots */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Available Times</span>
              </CardTitle>
              <CardDescription>Select an available time slot</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSlots ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : availableSlots && availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot: any) => (
                    <Button
                      key={slot.time}
                      variant={timeSlot === slot.time ? "default" : "outline"}
                      className={`justify-center ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => slot.available && setTimeSlot(slot.time)}
                      disabled={!slot.available}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No available time slots for the selected date.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right column - Interview details */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                <span>Interview Details</span>
              </CardTitle>
              <CardDescription>Configure interview settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Interview Type</Label>
                  <RadioGroup value={interviewType} onValueChange={setInterviewType} className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="video" id="video" />
                      <Label htmlFor="video" className="flex items-center gap-2">
                        <VideoIcon className="h-4 w-4" />
                        Video Interview
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in_person" id="in_person" />
                      <Label htmlFor="in_person" className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        In-Person Interview
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {interviewType === 'in_person' && (
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter interview location"
                      value={location}
                      onChange={(e) => setLocation2(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="interviewer">Interviewer Email</Label>
                  <Input
                    id="interviewer"
                    placeholder="Enter interviewer email"
                    value={interviewerEmail}
                    onChange={(e) => setInterviewerEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any notes or instructions"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                
                {interviewType === 'video' && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recording"
                      checked={recordingPermission}
                      onCheckedChange={setRecordingPermission}
                    />
                    <Label htmlFor="recording">Allow recording</Label>
                  </div>
                )}
                
                <Button
                  type="submit"
                  disabled={!date || !timeSlot || scheduleMutation.isPending}
                  className="w-full"
                >
                  {scheduleMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    'Schedule Interview'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Missing Clock component from lucide-react
const Clock = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export default InterviewScheduler;