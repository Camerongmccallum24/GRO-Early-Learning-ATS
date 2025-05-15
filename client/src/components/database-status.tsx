import React, { useState, useEffect } from 'react';
import { Shield, Database, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';

/**
 * Displays the current database connection status
 * Only visible to admin users in development mode
 */
const DatabaseStatus = () => {
  const [showStatus, setShowStatus] = useState(false);
  
  // Check if we're in development mode
  useEffect(() => {
    const isDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname.includes('replit.dev');
    setShowStatus(isDevelopment);
  }, []);

  // Query the database status endpoint
  const { data: status, isLoading } = useQuery({
    queryKey: ['/api/system/database-status'],
    enabled: showStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false
  });

  if (!showStatus || isLoading) return null;

  if (!status || !status.available) {
    return (
      <Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          <Database className="h-4 w-4" /> Database Unavailable
        </AlertTitle>
        <AlertDescription>
          The application is currently running with memory storage. 
          Data will not be persisted between sessions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="default" className="mt-2 bg-green-50 border-green-200">
      <Shield className="h-4 w-4 text-green-600" />
      <AlertTitle className="flex items-center gap-2 text-green-700">
        <Database className="h-4 w-4" /> Database Connected
      </AlertTitle>
      <AlertDescription className="text-green-600">
        Connected to Supabase PostgreSQL database.
      </AlertDescription>
    </Alert>
  );
};

export default DatabaseStatus;