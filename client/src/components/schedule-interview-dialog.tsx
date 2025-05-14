import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VideoInterviewForm } from "./video-interview-form";
import { Video } from "lucide-react";

interface ScheduleInterviewDialogProps {
  applicationId: number;
  candidateName: string;
  onInterviewScheduled?: () => void;
  triggerEl?: React.ReactNode;
}

export function ScheduleInterviewDialog({
  applicationId,
  candidateName,
  onInterviewScheduled,
  triggerEl,
}: ScheduleInterviewDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onInterviewScheduled) {
      onInterviewScheduled();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerEl || (
          <Button variant="outline" className="flex gap-2 items-center">
            <Video className="h-4 w-4" />
            Schedule Video Interview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Schedule Video Interview</DialogTitle>
          <DialogDescription>
            Schedule a video interview with {candidateName}. The candidate will receive a
            notification email with the details.
          </DialogDescription>
        </DialogHeader>
        <VideoInterviewForm
          applicationId={applicationId}
          candidateName={candidateName}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}