import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Link } from "wouter";

interface OverviewCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  className?: string;
  linkTo?: string;
}

export function OverviewCard({
  title,
  value,
  icon,
  iconBgColor = "bg-primary",
  className,
  linkTo,
}: OverviewCardProps) {
  const cardContent = (
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
  );

  if (linkTo) {
    return (
      <Link href={linkTo}>
        <Card className={cn("overflow-hidden shadow cursor-pointer transition-shadow hover:shadow-md", className)}>
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card className={cn("overflow-hidden shadow", className)}>
      {cardContent}
    </Card>
  );
}
