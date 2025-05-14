import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Briefcase, 
  Users, 
  ClipboardList, 
  Settings,
  Menu,
  X,
  User as UserIcon,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Define a type for the user object
interface AuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role?: string;
}

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileNav({ isOpen, onToggle }: MobileNavProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/jobs", label: "Job Postings", icon: Briefcase },
    { href: "/candidates", label: "Candidates", icon: Users },
    { href: "/applications", label: "Applications", icon: ClipboardList },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  // Current page title based on location
  const getPageTitle = () => {
    const currentRoute = navItems.find(item => item.href === location);
    return currentRoute?.label || 'Dashboard';
  };

  return (
    <>
      {/* Mobile top navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar h-16 flex items-center justify-between px-4">
        <div className="flex items-center">
          <button 
            onClick={onToggle} 
            className="mr-2 text-white p-2 rounded-md hover:bg-gray-700"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex items-center">
            <img src="/uploads/OIP.jpeg" alt="GRO Logo" className="h-8 w-8 rounded-md object-cover mr-2" />
            <span className="text-white font-semibold text-lg">GRO ATS</span>
          </div>
        </div>
        <div className="flex h-8 w-8 rounded-full items-center justify-center bg-gray-300 text-gray-800">
          {user?.firstName?.charAt(0) || user?.email?.charAt(0) || '?'}
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-sidebar pt-16 transition-transform duration-200 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={onToggle}
                className={cn(
                  "flex items-center px-2 py-2 text-base font-medium rounded-md",
                  isActive 
                    ? "text-white bg-primary" 
                    : "text-gray-300 hover:bg-gray-700"
                )}
              >
                <Icon className="mr-3 h-6 w-6" />
                <span className="sidebar-nav-label">{item.label}</span>
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-sidebar-border">
            <div className="flex items-center px-2 py-2">
              <div className="flex h-10 w-10 rounded-full items-center justify-center bg-gray-300 text-gray-800">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || '?'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.firstName ? `${user?.firstName} ${user?.lastName || ''}` : user?.email || 'User'}
                </p>
                <p className="text-xs font-medium text-gray-300">{user?.role === 'hr_admin' ? 'HR Manager' : user?.role || 'User'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center px-2 py-2 mt-2 w-full text-base font-medium rounded-md text-gray-300 hover:bg-gray-700"
            >
              <LogOut className="mr-3 h-6 w-6" />
              Logout
            </button>
          </div>
        </nav>
      </div>
      
      {/* Mobile header with page title */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between md:hidden">
        <h1 className="text-lg font-medium text-[#172B4D]">{getPageTitle()}</h1>
        {location === "/jobs" && (
          <Link href="/jobs/new">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
              <Menu className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </>
  );
}
