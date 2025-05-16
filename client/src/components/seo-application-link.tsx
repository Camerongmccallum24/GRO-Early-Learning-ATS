import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { 
  Link2, 
  Copy, 
  Check, 
  MoreVertical, 
  Pencil, 
  Share2 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface SEOApplicationLinkProps {
  jobId: number;
  jobTitle: string;
  category: string;
  location: string;
  applicationUrl: string;
  isMobile?: boolean;
  onEdit?: () => void;
}

export default function SEOApplicationLink({
  jobId,
  jobTitle,
  category,
  location,
  applicationUrl,
  isMobile = false,
  onEdit
}: SEOApplicationLinkProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [truncatedUrl, setTruncatedUrl] = useState(applicationUrl);

  // Truncate URL for display if needed
  useEffect(() => {
    if (applicationUrl) {
      // Logic to truncate URL for display based on screen size
      const maxLength = isMobile ? 35 : 60;
      setTruncatedUrl(
        applicationUrl.length > maxLength 
        ? applicationUrl.substring(0, maxLength) + "..." 
        : applicationUrl
      );
    }
  }, [applicationUrl, isMobile]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(applicationUrl);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Application link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareLink = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: `${jobTitle} - GRO Early Learning`,
          text: `Check out this job opportunity: ${jobTitle} at GRO Early Learning, ${location}`,
          url: applicationUrl
        });
        toast({
          title: "Link shared",
          description: "Application link shared successfully",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast({
            title: "Failed to share",
            description: "Could not share the application link",
            variant: "destructive",
          });
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Card className="p-4 mt-4 border border-[#87b6ad] bg-white shadow-sm">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-[#e89174]" />
          <h3 className="font-medium text-[#2c2c2c]">Application Link</h3>
          {onEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 ml-auto"
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit URL Slug
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareLink}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="text-xs text-gray-500 flex gap-2">
            <span className="px-2 py-0.5 bg-gray-100 rounded-full">{category}</span>
            <span className="px-2 py-0.5 bg-gray-100 rounded-full">{location}</span>
          </div>
          
          <div className="break-all bg-gray-50 p-2 rounded text-sm text-gray-700 border border-gray-200">
            {truncatedUrl}
          </div>
          
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 mt-2`}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size={isMobile ? "sm" : "default"}
                    className="flex-1"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy application link to clipboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {!isMobile && 'share' in navigator && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={shareLink}
                      className="ml-auto"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share application link</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}