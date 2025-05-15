import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface CategoryData {
  name: string;
  value: number;
  color?: string;
}

interface ApplicationsByCategoryProps {
  title: string;
  data: CategoryData[];
  selectedStage?: string;
  className?: string;
  maxItems?: number;
}

export function ApplicationsByCategory({
  title,
  data,
  selectedStage,
  className = "",
  maxItems = 5,
}: ApplicationsByCategoryProps) {
  // Use only the top N items
  const chartData = useMemo(() => {
    return data
      .sort((a, b) => b.value - a.value)
      .slice(0, maxItems);
  }, [data, maxItems]);

  // Default chart color
  const defaultColor = "#bcd7d0";

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg font-semibold flex items-center justify-between">
          <span>{title}</span>
          {selectedStage && (
            <span className="text-xs px-2 py-1 rounded bg-[#f4f5f7] text-gray-600">
              Stage: {selectedStage}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                scale="band"
                tick={{ fontSize: 12 }}
                width={110}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.375rem",
                  fontSize: "0.75rem",
                }}
                formatter={(value) => [`${value}`, "Applications"]}
              />
              <Bar dataKey="value" fill={defaultColor} radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || defaultColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}