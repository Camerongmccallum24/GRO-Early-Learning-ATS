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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    // Check if we have a saved collapsed state, and invert it (since expanded is the opposite of collapsed)
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsedState !== null) {
      return savedCollapsedState === 'false'; // if not collapsed, then it's expanded
    }
    // Default to not expanded
    return false;
  });
  
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Save sidebar state when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', isSidebarExpanded.toString());
  }, [isSidebarExpanded]);
  
  // Authentication check temporarily disabled

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Collapsible Sidebar (works for both desktop and mobile) */}
      <Sidebar 
        isMobile={true} 
        onCollapseChange={(collapsed) => setIsSidebarExpanded(!collapsed)} 
      />
      
      {/* Main content with responsive margin to accommodate sidebar */}
      <div 
        className={cn(
          "flex flex-col flex-1 overflow-hidden transition-all duration-300",
          "content-with-sidebar",
          isSidebarExpanded && "content-with-sidebar-expanded"
        )}
      >
        {/* Responsive main content area with better mobile adjustments */}
        <main className="flex-1 overflow-y-auto bg-[#F4F5F7] w-full max-w-full">
          {/* Mobile optimized content container with proper spacing */}
          <div className="px-3 pt-16 pb-6 sm:px-4 md:pt-6 md:px-6 lg:px-8 mx-auto">
            {children}
          </div>
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
