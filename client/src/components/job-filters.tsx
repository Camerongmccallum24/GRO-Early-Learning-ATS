import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface JobFiltersProps {
  onFilterChange: (filters: { 
    location?: number | string; 
    position?: string; 
    status?: string;
  }) => void;
}

export function JobFilters({ onFilterChange }: JobFiltersProps) {
  const [location, setLocation] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  
  // Fetch locations
  const { data: locations = [] } = useQuery({
    queryKey: ["/api/locations"],
  });
  
  // Fetch unique job positions
  const { data: jobPostings = [] } = useQuery({
    queryKey: ["/api/job-postings"],
  });
  
  // Extract unique job titles
  const uniquePositions = Array.from(
    new Set(jobPostings.map((job: any) => job.title))
  );
  
  useEffect(() => {
    onFilterChange({
      location: location ? Number(location) : "",
      position,
      status,
    });
  }, [location, position, status, onFilterChange]);
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="location-filter" className="block text-sm font-medium mb-1">
              Location
            </Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location-filter">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                {locations.map((loc: any) => (
                  <SelectItem key={loc.id} value={loc.id.toString()}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="position-filter" className="block text-sm font-medium mb-1">
              Position
            </Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger id="position-filter">
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Positions</SelectItem>
                {uniquePositions.map((pos: string) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="status-filter" className="block text-sm font-medium mb-1">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
