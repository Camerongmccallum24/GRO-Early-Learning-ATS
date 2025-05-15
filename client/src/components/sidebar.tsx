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
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    return savedState ? savedState === 'true' : false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isSmallScreen) {
      setIsMobileMenuOpen(false);
    }
  }, [location, isSmallScreen]);

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  };

  const authUser = user as AuthUser | undefined;

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3Icon, active: location === "/" },
    { name: "Job Postings", href: "/jobs", icon: BriefcaseIcon, active: location === "/jobs" || location.startsWith("/jobs/") },
    { name: "Applications", href: "/applications", icon: ClipboardListIcon, active: location === "/applications" },
    { name: "Candidates", href: "/candidates", icon: UserIcon, active: location === "/candidates" },
    { name: "How To Guides", href: "/guides", icon: BookOpenIcon, active: location === "/guides" },
    {
      name: "Settings",
      href: "/settings",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      active: location === "/settings"
    }
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <div className={cn(
        "fixed top-4 left-4 z-50 md:hidden",
        isMobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100",
        "transition-opacity duration-200",
      )}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
          className="rounded-full bg-[#e89174] text-white shadow-lg hover:bg-[#d8755b] h-12 w-12 
                    flex items-center justify-center focus:ring-2 focus:ring-[#7356ff] focus:ring-offset-2"
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar container */}
      <div className={cn(
        "fixed left-0 top-0 h-screen z-50 flex flex-col border-r border-gray-200 bg-[#f9f9f9]",
        "transition-all duration-300 ease-in-out",
        "overflow-y-auto overflow-x-hidden",
        isCollapsed ? "w-20" : "w-64",
        isSmallScreen ? "w-[280px] shadow-xl" : "",
        (isSmallScreen && !isMobileMenuOpen) ? "-translate-x-full" : "translate-x-0",
        !isSmallScreen ? "block" : isMobileMenuOpen ? "block" : "hidden"
      )}>
        {/* Header */}
        <div className="flex h-20 shrink-0 items-center border-b border-gray-200 px-4">
          <div className={cn(
            "flex flex-col items-center justify-center",
            isCollapsed ? "w-full" : "mx-auto"
          )}>
            <img src={groLogo} alt="GRO Early Learning" className="h-11 object-contain" />
            {!isCollapsed && (
              <div className="mt-1 text-center">
                <span className="text-xs font-medium text-gray-600">Applicant Tracking System</span>
              </div>
            )}
          </div>

          {/* Collapse toggle button - desktop only */}
          <button
            onClick={toggleCollapsed}
            className="absolute right-4 top-4 hidden lg:flex items-center justify-center h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 group relative"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
            <span className="sidebar-tooltip">{isCollapsed ? "Expand" : "Collapse"}</span>
          </button>

          {/* Mobile close button */}
          {isSmallScreen && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 flex items-center justify-center h-10 w-10 rounded-full 
                           text-[#2c2c2c] hover:bg-gray-100 focus:ring-2 focus:ring-[#7356ff] focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex flex-1 flex-col px-3">
          <ul className="flex flex-1 flex-col gap-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>
                  <div
                    className={cn(
                      item.active
                        ? "bg-[#e89174] text-white"
                        : "text-[#2c2c2c] hover:bg-gray-100 hover:text-[#7356ff]",
                      "group flex items-center gap-x-3 rounded-md p-3 text-sm font-semibold cursor-pointer",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <item.icon
                      className={cn(
                        item.active ? "text-white" : "text-[#2c2c2c] group-hover:text-[#7356ff]",
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
                  <div className="w-10 h-10 rounded-full bg-[#e89174] flex items-center justify-center text-white">
                    {authUser.firstName?.charAt(0) || authUser.email?.charAt(0) || '?'}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={logout}
              className={cn(
                "group flex items-center gap-x-3 rounded-md p-3 text-sm font-semibold text-[#2c2c2c] hover:bg-gray-100 hover:text-[#7356ff]",
                isCollapsed ? "justify-center w-full" : "w-full"
              )}
            >
              <LogOutIcon
                className="h-5 w-5 shrink-0 text-[#2c2c2c] group-hover:text-[#7356ff]"
                aria-hidden="true"
              />
              {!isCollapsed && <span>Log Out</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile - only visible when mobile sidebar is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}