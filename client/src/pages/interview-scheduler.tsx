import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Users, VideoIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

// Placeholder page for the interview scheduler
// This would integrate with Google Calendar in a real implementation

export default function InterviewScheduler() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  
  // Time slots
  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"
  ];
  
  const handleSchedule = () => {
    if (!date || !timeSlot) {
      toast({
        title: "Missing information",
        description: "Please select both date and time for the interview",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Interview scheduling",
      description: "This feature will integrate with Google Calendar to schedule interviews",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Interview Scheduler</h1>
        <p className="text-muted-foreground">Schedule interviews with candidates using Google Calendar</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Select Date and Time
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid gap-6">
              <div className="space-y-2">
                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Select Time Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={timeSlot === slot ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeSlot(slot)}
                      className="justify-start"
                    >
                      <Clock className="mr-2 h-3.5 w-3.5" />
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Interview Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Interview Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    <VideoIcon className="mr-2 h-4 w-4" />
                    Video Call
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    In Person
                  </Button>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  className="w-full bg-[#7356ff] hover:bg-[#634ad9]"
                  onClick={handleSchedule}
                >
                  Schedule Interview
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  This will send a calendar invite to the candidate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Google Calendar Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            When this feature is implemented, it will:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Connect with Google Calendar API to check for available time slots</li>
            <li>Create calendar events for scheduled interviews</li>
            <li>Send email invitations to candidates</li>
            <li>Generate unique video meeting links for remote interviews</li>
            <li>Allow HR staff to manage all scheduled interviews in one place</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}