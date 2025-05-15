import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link2, Copy, Loader2, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface ApplicationLinkSectionProps {
  jobId: number;
}

export default function ApplicationLinkSection({ jobId }: ApplicationLinkSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copying, setCopying] = useState<number | null>(null);

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

  const handleCopyLink = (link: string, id: number) => {
    setCopying(id);
    navigator.clipboard.writeText(link)
      .then(() => {
        toast({
          title: "Link copied to clipboard",
          description: "You can now share this link with candidates.",
        });
      })
      .catch((error) => {
        toast({
          title: "Error copying link",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      })
      .finally(() => {
        setTimeout(() => setCopying(null), 1000);
      });
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
        <div className="space-y-3">
          {applicationLinks.map((link: any) => (
            <div key={link.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Link2 className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium">Link {link.id}</span>
                </div>
                <span className="text-xs text-gray-500">
                  Created {formatDate(link.createdAt)}
                </span>
              </div>
              <div className="flex">
                <Input
                  value={link.applicationUrl}
                  readOnly
                  className="text-sm font-mono bg-white"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-2"
                  onClick={() => handleCopyLink(link.applicationUrl, link.id)}
                >
                  {copying === link.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>Clicks: {link.clickCount || 0}</span>
                {link.expiryDate && (
                  <span>Expires: {formatDate(link.expiryDate)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}