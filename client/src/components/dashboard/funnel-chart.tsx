import { useMemo } from "react";
import {
  FunnelChart,
  Funnel,
  Cell,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface FunnelStage {
  name: string;
  count: number;
  conversion: number;
  value: number;
  color: string;
}

interface HiringFunnelProps {
  data: FunnelStage[];
  onStageClick?: (stage: string) => void;
  selectedStage?: string;
  className?: string;
}

export function HiringFunnel({ 
  data, 
  onStageClick, 
  selectedStage,
  className = "" 
}: HiringFunnelProps) {
  
  // Prepare data for rendering with proper colors
  const funnelData = useMemo(() => {
    return data.map((stage) => ({
      ...stage,
      fill: selectedStage === stage.name ? 
        stage.color.replace(")", ", 0.85)").replace("rgb", "rgba") : 
        stage.color
    }));
  }, [data, selectedStage]);

  // Custom tooltip for the funnel chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-xs text-gray-600">Count: {data.count}</p>
          <p className="text-xs text-gray-600">
            Conversion: {Math.round(data.conversion * 100)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Hiring Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center">
          {/* Funnel chart with responsive container */}
          <div className="w-full md:w-3/5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip content={<CustomTooltip />} />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                  onClick={(data) => onStageClick && onStageClick(data.name)}
                >
                  <LabelList
                    position="right"
                    fill="#555"
                    stroke="none"
                    dataKey="count"
                    className="text-xs"
                  />
                  {funnelData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill}
                      style={{ cursor: 'pointer' }}
                      className="hover:opacity-90 transition-opacity"
                    />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          {/* Stage metrics with conversion rates */}
          <div className="w-full md:w-2/5 grid grid-cols-1 gap-2 mt-4 md:mt-0 md:pl-4">
            {data.map((stage) => (
              <div 
                key={stage.name}
                onClick={() => onStageClick && onStageClick(stage.name)}
                className={`
                  border rounded-md px-4 py-2 flex justify-between items-center transition-all
                  ${selectedStage === stage.name ? 'border-[#7356ff] bg-[#7356ff]/5' : 'border-gray-200 hover:border-gray-300'}
                  cursor-pointer
                `}
              >
                <span className="font-medium">{stage.name}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold">{stage.count}</div>
                  <div className="text-xs text-gray-500">{Math.round(stage.conversion * 100)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}