import { Link, useLocation } from "wouter";
import {
  BarChart3Icon,
  BriefcaseIcon,
  ClipboardListIcon,
  LogOutIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  BookOpenIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import groLogo from "../assets/gro-logo.svg";

// Define a type for the user object
interface AuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role?: string;
}

interface SidebarProps {
  isMobile?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function Sidebar({ isMobile = false, onCollapseChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isPinned, setIsPinned] = useState(() => {
    // Check localStorage for saved pinned state
    return localStorage.getItem('sidebar-pinned') === 'true';
  });
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Check localStorage for saved state
    const savedState = localStorage.getItem('sidebar-collapsed');
    return savedState ? savedState === 'true' : false;
  });
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Reset mobile menu state when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  // Save collapsed state to localStorage and notify parent
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
    
    // Notify parent component if callback provided
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  };
  
  // Toggle pinned state
  const togglePinned = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    localStorage.setItem('sidebar-pinned', String(newPinnedState));
    
    // Auto-expand sidebar when pinned
    if (newPinnedState && isCollapsed) {
      toggleCollapsed();
    }
    // Auto-collapse sidebar when unpinned (optional)
    else if (!newPinnedState && !isCollapsed) {
      toggleCollapsed();
    }
  };

  // Cast user to the AuthUser type
  const authUser = user as AuthUser | undefined;

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: BarChart3Icon,
      active: location === "/",
    },
    {
      name: "Job Postings",
      href: "/jobs",
      icon: BriefcaseIcon,
      active: location === "/jobs" || location.startsWith("/jobs/"),
    },
    {
      name: "Applications",
      href: "/applications",
      icon: ClipboardListIcon,
      active: location === "/applications",
    },
    {
      name: "Candidates",
      href: "/candidates",
      icon: UserIcon,
      active: location === "/candidates",
    },
    {
      name: "How To Guides",
      href: "/guides",
      icon: BookOpenIcon,
      active: location === "/guides",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          {...props}
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ),
      active: location === "/settings",
    },
  ];

  return (
    <>
      {/* Mobile toggle button - only visible on mobile */}
      <div className="fixed top-4 left-4 z-40 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 h-12 w-12"
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar for desktop and mobile */}
      <div 
        className={cn(
          "fixed inset-y-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          // On mobile: show if open, hide if closed
          // On desktop: always show, but respect collapsed state
          isMobileMenuOpen ? "left-0 shadow-xl" : "lg:left-0 -left-full"
        )}
      >
        <div className="flex h-screen flex-grow flex-col overflow-y-auto">
          {/* Header with logo and collapse toggle */}
          <div className={cn(
            "flex h-20 shrink-0 items-center border-b border-gray-200 px-4",
            isCollapsed ? "justify-center" : "justify-center"
          )}>
            <div className={cn(
              "flex flex-col items-center justify-center",
              isCollapsed ? "w-full" : "mx-auto"
            )}>
              <img src={groLogo} alt="GRO Early Learning" className="h-11 object-contain" />
              {!isCollapsed && 
                <div className="mt-1 text-center">
                  <span className="text-xs font-medium text-gray-600">Applicant Tracking System</span>
                </div>
              }
            </div>
            
            
            {/* Toggle collapse button - desktop only */}
            <button 
              onClick={toggleCollapsed}
              className="absolute right-4 top-4 hidden lg:flex items-center justify-center h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 group relative"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
              <span className="sidebar-tooltip">{isCollapsed ? "Expand" : "Collapse"}</span>
            </button>
            
            {/* Pin sidebar button - desktop only */}
            <button 
              onClick={togglePinned}
              className="absolute right-14 top-4 hidden lg:flex items-center justify-center h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 group relative"
              title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
            >
              {isPinned ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m16 2-4.7 4.7-3.8-1.5 5.5 5.5-8 8V22l2-2 8-8 5.5 5.5-1.5-3.8L24 8z"/>
                  <path d="M10.5 13.5 2 22"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="17" x2="12" y2="22" />
                  <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
                </svg>
              )}
              <span className="sidebar-tooltip">{isPinned ? "Unpin" : "Pin"}</span>
            </button>
            
            {/* Close button - mobile only */}
            {isMobileMenuOpen && (
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden flex items-center justify-center h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Navigation items */}
          <nav className="mt-5 flex flex-1 flex-col px-3">
            <ul className="flex flex-1 flex-col gap-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        item.active
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        "group flex items-center gap-x-3 rounded-md p-3 text-sm font-semibold cursor-pointer",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <item.icon
                        className={cn(
                          item.active ? "text-white" : "text-gray-500 group-hover:text-gray-900",
                          "h-5 w-5 shrink-0"
                        )}
                        aria-hidden="true"
                      />
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/* User profile and logout */}
            <div className="mt-auto pb-5 border-t border-gray-200 pt-3">
              {authUser && !isCollapsed && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 p-3">
                    {authUser.profileImageUrl && (
                      <img 
                        src={authUser.profileImageUrl} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                    )}
                    <div className="text-sm overflow-hidden">
                      <div className="font-medium text-gray-900 truncate">
                        {authUser.firstName ? `${authUser.firstName} ${authUser.lastName || ''}` : authUser.email || 'GRO Staff'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {authUser.email || ''}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Profile image only when collapsed */}
              {authUser && isCollapsed && (
                <div className="flex justify-center mb-3">
                  {authUser.profileImageUrl ? (
                    <img 
                      src={authUser.profileImageUrl} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                      {authUser.firstName?.charAt(0) || authUser.email?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={logout}
                className={cn(
                  "group flex items-center gap-x-3 rounded-md p-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  isCollapsed ? "justify-center w-full" : "w-full"
                )}
              >
                <LogOutIcon
                  className="h-5 w-5 shrink-0 text-gray-500 group-hover:text-gray-900"
                  aria-hidden="true"
                />
                {!isCollapsed && <span>Log Out</span>}
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay for mobile - only visible when mobile sidebar is open */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}