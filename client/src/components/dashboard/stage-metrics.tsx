import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StageMetric {
  id: string;
  label: string;
  value: number;
  stage: string;
  color?: string;
  icon?: React.ReactNode;
}

interface StageMetricsProps {
  metrics: StageMetric[];
  selectedStage?: string;
  onStageClick?: (stage: string) => void;
  className?: string;
}

export function StageMetrics({
  metrics,
  selectedStage,
  onStageClick,
  className = "",
}: StageMetricsProps) {
  
  // Filter metrics based on selected stage if provided
  const filteredMetrics = selectedStage
    ? metrics.filter((metric) => metric.stage === selectedStage || metric.stage === "all")
    : metrics;

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {filteredMetrics.map((metric) => (
        <Card 
          key={metric.id}
          className={cn(
            "overflow-hidden transition-all duration-200 cursor-pointer",
            selectedStage === metric.stage && "ring-2 ring-[#7356ff] ring-opacity-50"
          )}
          onClick={() => onStageClick && onStageClick(metric.stage)}
        >
          <CardContent className="p-4">
            <div className="flex items-center">
              {metric.icon && (
                <div className="mr-3">{metric.icon}</div>
              )}
              <div>
                <p className="text-3xl font-bold">
                  {metric.value}
                </p>
                <p className="text-sm text-gray-600 mt-1">{metric.label}</p>
              </div>
            </div>
            {metric.color && (
              <div 
                className="h-1 mt-3 rounded-full" 
                style={{ backgroundColor: metric.color }} 
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}