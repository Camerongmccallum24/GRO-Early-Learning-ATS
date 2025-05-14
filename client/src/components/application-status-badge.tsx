import { cn } from "@/lib/utils";
import { getStatusClass, formatApplicationStatus } from "@/lib/utils";

interface ApplicationStatusBadgeProps {
  status: string;
  className?: string;
}

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  return (
    <span
      className={cn(
        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
        getStatusClass(status),
        className
      )}
    >
      {formatApplicationStatus(status)}
    </span>
  );
}
