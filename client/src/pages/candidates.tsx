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

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Fetch candidates data
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["/api/candidates"],
  });

  // Filter candidates based on search term
  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return candidates;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return candidates.filter((candidate: any) => {
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
  const handleCandidateClick = (candidate: any) => {
    setSelectedCandidate(candidate);
  };

  // Close candidate details dialog
  const handleCloseDetails = () => {
    setSelectedCandidate(null);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 pb-16">
      {/* Page Title (only visible on desktop) */}
      <div className="bg-white border-b border-gray-200 md:flex md:items-center md:justify-between p-4 md:py-2 md:px-6 md:h-16 hidden">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium leading-6 text-[#172B4D]">Candidates</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search candidates by name, email, skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Candidates List */}
      <Card className="shadow overflow-hidden">
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-lg">Candidate Database</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Qualifications</TableHead>
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
                      <TableCell>{candidate.phone || "-"}</TableCell>
                      <TableCell>
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

      {/* Candidate Details Dialog */}
      {selectedCandidate && (
        <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle>Candidate Profile</DialogTitle>
              <DialogDescription className="text-xs">
                Detailed information about {selectedCandidate.name}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3">
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <div className="text-gray-600 font-medium text-xl">
                        {selectedCandidate.name?.charAt(0) || "?"}
                      </div>
                    </div>
                    <h3 className="text-base font-medium text-center">{selectedCandidate.name}</h3>
                    <p className="text-xs text-gray-500 text-center mb-2">{selectedCandidate.email}</p>
                    
                    {selectedCandidate.phone && (
                      <p className="text-xs text-center mb-2">
                        <span className="font-medium">Phone:</span> {selectedCandidate.phone}
                      </p>
                    )}
                    
                    {selectedCandidate.resumePath && (
                      <Button variant="outline" size="sm" className="w-full mb-2 text-xs py-1 px-2 h-auto">
                        <FileIcon className="h-3 w-3 mr-1" /> 
                        View Resume
                      </Button>
                    )}
                    
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Applied on {formatDate(selectedCandidate.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <Tabs defaultValue="education">
                    <TabsList className="grid grid-cols-3 mb-2">
                      <TabsTrigger value="education" className="text-xs py-1 h-8">Education</TabsTrigger>
                      <TabsTrigger value="experience" className="text-xs py-1 h-8">Experience</TabsTrigger>
                      <TabsTrigger value="skills" className="text-xs py-1 h-8">Skills</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="education">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <h4 className="font-medium mb-1 text-sm">Education & Qualifications</h4>
                        <p className="text-xs whitespace-pre-line max-h-[150px] overflow-y-auto">
                          {selectedCandidate.education || "No education information provided."}
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="experience">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <h4 className="font-medium mb-1 text-sm">Professional Experience</h4>
                        <p className="text-xs whitespace-pre-line max-h-[150px] overflow-y-auto">
                          {selectedCandidate.experience || "No experience information provided."}
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="skills">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <h4 className="font-medium mb-1 text-sm">Skills & Competencies</h4>
                        <p className="text-xs whitespace-pre-line max-h-[150px] overflow-y-auto">
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
                  
                  {/* AI-Powered Match Analysis */}
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
