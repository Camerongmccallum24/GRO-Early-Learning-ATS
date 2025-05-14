import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Time slots for the interview
const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

// Form validation schema
const videoInterviewSchema = z.object({
  scheduledDate: z.date({
    required_error: "Please select a date for the interview",
  }).min(new Date(), {
    message: "Interview date cannot be in the past",
  }),
  timeSlot: z.string({
    required_error: "Please select a time slot",
  }),
  duration: z.preprocess(
    (val) => parseInt(val as string, 10),
    z.number({
      required_error: "Please enter a duration",
    }).min(15, {
      message: "Duration must be at least 15 minutes",
    }).max(120, {
      message: "Duration cannot exceed 120 minutes",
    })
  ),
  videoLink: z.string().url({
    message: "Please enter a valid URL for the video conference",
  }),
  recordingPermission: z.boolean().default(false),
  notes: z.string().optional(),
});

type VideoInterviewFormValues = z.infer<typeof videoInterviewSchema>;

interface VideoInterviewFormProps {
  applicationId: number;
  candidateName: string;
  onSuccess?: () => void;
}

export function VideoInterviewForm({
  applicationId,
  candidateName,
  onSuccess
}: VideoInterviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<VideoInterviewFormValues>({
    resolver: zodResolver(videoInterviewSchema),
    defaultValues: {
      duration: 30,
      recordingPermission: false,
      notes: "",
    },
  });

  const scheduleInterview = useMutation({
    mutationFn: async (values: VideoInterviewFormValues) => {
      const dateObj = values.scheduledDate;
      const [hours, minutes] = values.timeSlot.split(':').map(Number);
      dateObj.setHours(hours, minutes);
      
      const response = await fetch(`/api/applications/${applicationId}/schedule-interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduledDate: dateObj.toISOString(),
          duration: values.duration,
          interviewType: "video",
          videoLink: values.videoLink,
          recordingPermission: values.recordingPermission,
          notes: values.notes || "",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to schedule interview");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Interview Scheduled",
        description: `Video interview has been scheduled with ${candidateName}`,
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}`] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to schedule interview",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  function onSubmit(values: VideoInterviewFormValues) {
    setIsSubmitting(true);
    scheduleInterview.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Interview Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeSlot"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Slot</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    min={15}
                    max={120}
                    step={15}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="videoLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Conference Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://meet.google.com/..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="recordingPermission"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Request recording permission
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  The candidate will be asked to consent to recording the interview for review purposes.
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional instructions for the candidate..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Scheduling..." : "Schedule Video Interview"}
        </Button>
      </form>
    </Form>
  );
}