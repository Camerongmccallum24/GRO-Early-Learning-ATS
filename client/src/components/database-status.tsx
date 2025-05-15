import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { AlertCircle, Database, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DatabaseStatus() {
  const { toast } = useToast();
  const [showBanner, setShowBanner] = useState(false);

  // Query for database status
  const { data: dbStatus, error } = useQuery({
    queryKey: ["/api/system/database-status"],
    queryFn: async () => {
      const response = await fetch("/api/system/database-status");
      if (!response.ok) {
        throw new Error("Failed to fetch database status");
      }
      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Show notification on error or when database is unavailable
  useEffect(() => {
    if (error || (dbStatus && !dbStatus.available)) {
      setShowBanner(true);
      toast({
        title: "Database Connection Issue",
        description: "The system is currently running in memory-only mode. Your data will not be saved permanently.",
        variant: "destructive",
        duration: 5000,
      });
    } else if (dbStatus?.available) {
      setShowBanner(false);
    }
  }, [dbStatus, error, toast]);

  // Don't render anything if database is available and working properly
  if (!showBanner && dbStatus?.available) {
    return null;
  }

  // Show banner when database is not available
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md bg-white rounded-lg shadow-lg border border-amber-400 p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        {error ? (
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        ) : (
          <Database className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">
            {error 
              ? "Error Checking Database Status" 
              : "Using Memory Storage"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {error
              ? "We're having trouble determining database status. Your changes may not be saved permanently."
              : "The application is running with temporary storage. Your data will not be preserved if the application restarts."}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Using fallback memory storage
            </span>
          </div>
        </div>
        <button 
          onClick={() => setShowBanner(false)}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Dismiss"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}