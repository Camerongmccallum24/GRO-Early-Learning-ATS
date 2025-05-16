import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Loader2, Plus, Globe, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import SEOApplicationLink from "./seo-application-link";

interface ApplicationLinkSectionProps {
  jobId: number;
}

export default function ApplicationLinkSection({ jobId }: ApplicationLinkSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingLink, setEditingLink] = useState<any>(null);
  const [customSlug, setCustomSlug] = useState("");
  const [slugEditOpen, setSlugEditOpen] = useState(false);
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Update mobile state on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch existing application links for this job
  const { data: applicationLinks = [], isLoading } = useQuery({
    queryKey: [`/api/job-postings/${jobId}/application-links`],
    queryFn: async ({ queryKey }) => {
      const [url] = queryKey;
      const response = await fetch(url as string, { credentials: "include" });
      if (!response.ok) {
        throw new Error("Failed to fetch application links");
      }
      return response.json();
    },
  });

  // Create application link mutation
  const createLinkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/job-postings/${jobId}/application-links`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/job-postings/${jobId}/application-links`] });
      toast({
        title: "Application link created successfully",
        description: "You can now share this link with candidates.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating application link",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });
  
  // Update URL slug mutation
  const updateSlugMutation = useMutation({
    mutationFn: async (data: { linkId: number, customSlug: string }) => {
      return apiRequest("PATCH", `/api/application-links/${data.linkId}/slug`, {
        customUrlSlug: data.customSlug
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/job-postings/${jobId}/application-links`] });
      toast({
        title: "URL slug updated",
        description: "The application link URL has been updated successfully.",
      });
      setSlugEditOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating URL slug",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });
  
  const handleEditSlug = (link: any) => {
    setEditingLink(link);
    setCustomSlug(link.customUrlSlug || "");
    setSlugEditOpen(true);
  };
  
  const handleSaveSlug = () => {
    if (editingLink) {
      updateSlugMutation.mutate({
        linkId: editingLink.id,
        customSlug: customSlug.trim()
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">
          {applicationLinks.length > 0 ? `${applicationLinks.length} Active Links` : "No active links"}
        </h3>
        <Button
          size="sm"
          onClick={() => createLinkMutation.mutate()}
          disabled={createLinkMutation.isPending}
        >
          {createLinkMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create New Link
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      ) : applicationLinks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Link2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Application Links</h3>
            <p className="text-sm text-gray-500 mb-4">
              Create your first application link to share with candidates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applicationLinks.map((link: any) => (
            <div key={link.id} className="space-y-1">
              <SEOApplicationLink
                jobId={jobId}
                jobTitle={link.jobTitle || "Job Posting"}
                category={link.categoryName || "Job"}
                location={link.city || "Location"}
                applicationUrl={link.applicationUrl}
                isMobile={isMobile}
                onEdit={() => handleEditSlug(link)}
              />
              
              <div className="flex justify-between items-center px-4 py-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span>Created {formatDate(link.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3 text-gray-400" />
                  <span>Clicks: {link.clickCount || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* URL Slug Edit Dialog */}
      <Dialog open={slugEditOpen} onOpenChange={setSlugEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit URL Slug</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="custom-slug">Custom URL Slug</Label>
            <div className="mt-2 mb-1 text-xs text-gray-500">
              The URL slug appears in the application link and can help with SEO.
            </div>
            <Input
              id="custom-slug"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="e.g., lead-teacher-position"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSlugEditOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSlug}
              disabled={updateSlugMutation.isPending}
            >
              {updateSlugMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}