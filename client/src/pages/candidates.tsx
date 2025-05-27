import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useState, useMemo } from "react";
import { SearchIcon, Download, FileIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateMatchProfile } from "@/components/candidate-match-profile";

// Define candidate type for better type safety
interface Candidate {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  education?: string;
  skills?: string;
  experience?: string;
  resumePath?: string;
  createdAt: string;
}

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Fetch candidates data
  const { data: candidates = [], isLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  // Filter candidates based on search term
  const filteredCandidates = useMemo(() => {
    if (!candidates) return []; // Add null check for candidates
    if (!searchTerm) return candidates;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return candidates.filter((candidate) => {
      return (
        candidate.name?.toLowerCase().includes(lowerSearchTerm) ||
        candidate.email?.toLowerCase().includes(lowerSearchTerm) ||
        candidate.phone?.toLowerCase().includes(lowerSearchTerm) ||
        candidate.education?.toLowerCase().includes(lowerSearchTerm) ||
        candidate.skills?.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [candidates, searchTerm]);

  // Handle candidate selection for details view
  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  // Close candidate details dialog
  const handleCloseDetails = () => {
    setSelectedCandidate(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 pb-16 container-responsive">
      {/* Responsive page header - visible on all devices */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 page-header">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-medium leading-6 text-[#172B4D]">Candidates</h1>
        </div>
        <Button variant="outline" className="hidden sm:flex sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Search Bar - responsive layout */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Button variant="outline" className="sm:hidden w-full flex justify-center">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Candidates List */}
      <Card className="shadow overflow-hidden">
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Candidate Database</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View - Only shown on small screens */}
          <div className="sm:hidden divide-y divide-gray-200">
            {isLoading ? (
              <div className="text-center py-8">
                Loading candidates...
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-8">
                No candidates found
              </div>
            ) : (
              filteredCandidates.map((candidate: any) => (
                <div 
                  key={candidate.id} 
                  className="p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                  onClick={() => handleCandidateClick(candidate)}
                >
                  <div className="flex items-center mb-2">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <div className="text-gray-600 font-medium">
                        {candidate.name?.charAt(0) || "?"}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                      <div className="text-xs text-gray-500">{candidate.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium text-gray-500">Phone:</span> {candidate.phone || "-"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Applied:</span> {formatDate(candidate.createdAt)}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-500">Qualifications:</span> 
                      <div className="truncate">{candidate.education || "-"}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Desktop Table View - Only shown on medium screens and up */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Qualifications</TableHead>
                  <TableHead>Applied Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading candidates...
                    </TableCell>
                  </TableRow>
                ) : filteredCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((candidate: any) => (
                    <TableRow 
                      key={candidate.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleCandidateClick(candidate)}
                    >
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <div className="text-gray-600 font-medium">
                              {candidate.name?.charAt(0) || "?"}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{candidate.phone || "-"}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="truncate max-w-xs">{candidate.education || "-"}</div>
                      </TableCell>
                      <TableCell>{formatDate(candidate.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Details Dialog - Enhanced for mobile */}
      {selectedCandidate && (
        <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg font-semibold">Candidate Profile</DialogTitle>
              <DialogDescription className="text-xs">
                Detailed information about {selectedCandidate.name}
              </DialogDescription>
            </DialogHeader>
            
            {/* Mobile-optimized candidate details */}
            <div className="mt-2">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Profile section - stacked on mobile, side column on desktop */}
                <div className="w-full md:w-1/3 mb-4 md:mb-0">
                  <div className="flex flex-col sm:flex-row md:flex-col items-center sm:items-start md:items-center">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-2 sm:mr-4 md:mr-0">
                      <div className="text-gray-600 font-medium text-xl">
                        {selectedCandidate.name?.charAt(0) || "?"}
                      </div>
                    </div>
                    <div className="text-center sm:text-left md:text-center">
                      <h3 className="text-base font-medium">{selectedCandidate.name}</h3>
                      <p className="text-xs text-gray-500 mb-1">{selectedCandidate.email}</p>
                      
                      {selectedCandidate.phone && (
                        <p className="text-xs mb-1">
                          <span className="font-medium">Phone:</span> {selectedCandidate.phone}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Applied on {formatDate(selectedCandidate.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Resume button - full width and more touch-friendly */}
                  {selectedCandidate.resumePath && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-3 py-2 text-sm h-auto"
                    >
                      <FileIcon className="h-4 w-4 mr-2" /> 
                      View Resume
                    </Button>
                  )}
                </div>
                
                {/* Tabs section - optimized for different screen sizes */}
                <div className="w-full md:w-2/3">
                  <Tabs defaultValue="education">
                    <TabsList className="grid grid-cols-3 mb-2 w-full">
                      <TabsTrigger value="education" className="text-xs py-1.5 h-9">Education</TabsTrigger>
                      <TabsTrigger value="experience" className="text-xs py-1.5 h-9">Experience</TabsTrigger>
                      <TabsTrigger value="skills" className="text-xs py-1.5 h-9">Skills</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="education">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <h4 className="font-medium mb-1 text-sm">Education & Qualifications</h4>
                        <p className="text-xs whitespace-pre-line max-h-[200px] sm:max-h-[150px] overflow-y-auto">
                          {selectedCandidate.education || "No education information provided."}
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="experience">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <h4 className="font-medium mb-1 text-sm">Professional Experience</h4>
                        <p className="text-xs whitespace-pre-line max-h-[200px] sm:max-h-[150px] overflow-y-auto">
                          {selectedCandidate.experience || "No experience information provided."}
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="skills">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <h4 className="font-medium mb-1 text-sm">Skills & Competencies</h4>
                        <p className="text-xs whitespace-pre-line max-h-[200px] sm:max-h-[150px] overflow-y-auto">
                          {selectedCandidate.skills || "No skills information provided."}
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  {/* Candidate Applications Section */}
                  <div className="mt-3">
                    <h4 className="font-medium mb-1 text-sm">Applications</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs">
                        Candidate applications will be displayed here when available.
                      </p>
                    </div>
                  </div>
                  
                  {/* AI-Powered Match Analysis - optimized for mobile */}
                  {selectedCandidate && selectedCandidate.id && (
                    <div className="mt-3">
                      <CandidateMatchProfile 
                        candidateId={selectedCandidate.id} 
                        candidateName={selectedCandidate.name || "Candidate"}
                        compact={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
