import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface ApplicationRowData {
  id: number;
  candidateName: string;
  position: string;
  stage: string;
  date: string;
  location?: string;
}

interface ApplicationsTableProps {
  title?: string;
  data: ApplicationRowData[];
  selectedStage?: string | null;
  maxItems?: number;
  className?: string;
}

export function ApplicationsTable({
  title = "Recent Applications",
  data,
  selectedStage,
  maxItems = 5,
  className = "",
}: ApplicationsTableProps) {
  // Filter by stage if selected and display only up to maxItems
  const tableData = useMemo(() => {
    let filteredData = selectedStage
      ? data.filter((app) => {
          // Case-insensitive comparison to handle potential casing differences
          return app.stage.toLowerCase() === selectedStage.toLowerCase();
        })
      : data;

    return filteredData.slice(0, maxItems);
  }, [data, selectedStage, maxItems]);

  // Color mapping for stages
  const stageColors: Record<string, string> = {
    "Posted": "bg-blue-100 text-blue-800",
    "Applied": "bg-purple-100 text-purple-800",
    "Screening": "bg-yellow-100 text-yellow-800",
    "Interview": "bg-indigo-100 text-indigo-800",
    "Offer": "bg-green-100 text-green-800",
    "Hired": "bg-emerald-100 text-emerald-800",
    "Rejected": "bg-red-100 text-red-800",
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg font-semibold flex items-center justify-between">
          <span>
            {selectedStage ? `${title} (Stage: ${selectedStage})` : title}
          </span>
          {selectedStage && (
            <Badge variant="outline" className="ml-2">
              {selectedStage}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="whitespace-nowrap">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No applications found
                    {selectedStage && ` in ${selectedStage} stage`}.
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.candidateName}
                    </TableCell>
                    <TableCell>{application.position}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          stageColors[application.stage] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {application.stage}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDate(application.date)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}