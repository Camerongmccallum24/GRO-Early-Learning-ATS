import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DatabaseStatus } from "@/components/database-status";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import JobPostings from "@/pages/job-postings";
import JobPostingForm from "@/pages/job-posting-form";
import Candidates from "@/pages/candidates";
import Applications from "@/pages/applications";
import Interviews from "@/pages/interviews";
import InterviewScheduler from "@/pages/interview-scheduler";
import Settings from "@/pages/settings";
import HowToGuides from "@/pages/how-to-guides";
import Login from "@/pages/login";
import Apply from "@/pages/apply";
import { Sidebar } from "@/components/sidebar";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    return savedState ? savedState === 'false' : true; // Default to expanded if not set
  });
  
  const { user } = useAuth();
  const [location] = useLocation();
  
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(!isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isMobile={true} 
        onCollapseChange={setIsCollapsed} 
      />
      
      <div 
        className={cn(
          "flex flex-col flex-1 overflow-hidden transition-all duration-300",
          "content-with-sidebar",
          !isCollapsed ? "content-with-sidebar-expanded" : ""
        )}
      >
        <main className="flex-1 overflow-y-auto bg-[#F4F5F7] w-full">
          <div className={cn(
            "px-3 pb-6 mx-auto transition-all duration-300",
            "md:pl-24",
            !isCollapsed ? "md:pl-72" : "",
            "pt-16 md:pt-6 sm:px-4 md:px-6 lg:px-8"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Authentication checks temporarily disabled
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
      
      <Route path="/interviews">
        {() => (
          <ProtectedRoute>
            <Layout>
              <Interviews />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/interviews/schedule">
        {() => (
          <ProtectedRoute>
            <Layout>
              <InterviewScheduler />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/guides">
        {() => (
          <ProtectedRoute>
            <Layout>
              <HowToGuides />
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

      <Route path="/apply/:jobId/:hash">
        {(params) => <Apply />}
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
        <DatabaseStatus />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;