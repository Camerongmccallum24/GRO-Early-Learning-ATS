import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Get error message from URL if it exists
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    // Use full URL to avoid issues with hostname 
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/api/login`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-[350px] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">GRO Early Learning</CardTitle>
          <CardDescription className="text-center">
            Applicant Tracking System
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {errorMessage && (
            <Alert variant="destructive" className="mb-2">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Login with Replit</span>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <Button 
              onClick={handleLogin} 
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              Sign in
            </Button>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="mt-2 text-xs text-center text-gray-700">
            Secure login powered by Replit Auth
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}