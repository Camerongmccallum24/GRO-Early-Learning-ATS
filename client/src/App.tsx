import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import JobPostings from "@/pages/job-postings";
import JobPostingForm from "@/pages/job-posting-form";
import Candidates from "@/pages/candidates";
import Applications from "@/pages/applications";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

// Loading component to show during authentication
function LoadingAuth() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F4F5F7]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Authenticating with Replit...</p>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { user } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location]);
  
  // Authentication check temporarily disabled

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Mobile navigation */}
      <MobileNav 
        isOpen={isMobileNavOpen} 
        onToggle={() => setIsMobileNavOpen(!isMobileNavOpen)} 
      />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-[#F4F5F7] pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Authentication check temporarily disabled
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        {() => <Login />}
      </Route>
      
      <Route path="/">
        {() => (
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/jobs">
        {() => (
          <ProtectedRoute>
            <Layout>
              <JobPostings />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/jobs/new">
        {() => (
          <ProtectedRoute>
            <Layout>
              <JobPostingForm />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/jobs/edit/:id">
        {(params) => (
          <ProtectedRoute>
            <Layout>
              <JobPostingForm id={params.id} />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/candidates">
        {() => (
          <ProtectedRoute>
            <Layout>
              <Candidates />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/applications">
        {() => (
          <ProtectedRoute>
            <Layout>
              <Applications />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/settings">
        {() => (
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
