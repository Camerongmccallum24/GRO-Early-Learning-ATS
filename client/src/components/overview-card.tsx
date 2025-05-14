import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface OverviewCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  className?: string;
}

export function OverviewCard({
  title,
  value,
  icon,
  iconBgColor = "bg-primary",
  className,
}: OverviewCardProps) {
  return (
    <Card className={cn("overflow-hidden shadow", className)}>
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
              {icon}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-muted-foreground truncate">{title}</dt>
                <dd>
                  <div className="text-lg font-medium text-foreground">{value}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
