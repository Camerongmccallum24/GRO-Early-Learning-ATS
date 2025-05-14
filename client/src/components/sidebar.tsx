import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "./auth-provider";
import { 
  Home, 
  Briefcase, 
  Users, 
  ClipboardList, 
  Settings,
  LogOut
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function Sidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/jobs", label: "Job Postings", icon: Briefcase },
    { href: "/candidates", label: "Candidates", icon: Users },
    { href: "/applications", label: "Applications", icon: ClipboardList },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-sidebar">
        <div className="flex items-center justify-center h-16 px-4 border-b border-opacity-20 border-sidebar-border">
          <div className="flex items-center">
            <div className="flex items-center justify-center p-2 bg-white rounded-md mr-2">
              {/* GRO Logo */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0052CC"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-primary"
              >
                <path d="M18 10.5L13.5 5.5 12 4 4 12 12 20 20 12 12 4"></path>
                <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"></path>
                <path d="M9.17 14.83a4 4 0 1 0 0-5.66"></path>
              </svg>
            </div>
            <div>
              <span className="text-white font-semibold text-lg">GRO</span>
              <span className="text-white text-xs block -mt-1">Early Learning</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-grow">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-base font-medium rounded-md",
                    isActive 
                      ? "text-white bg-primary" 
                      : "text-gray-300 hover:bg-gray-700"
                  )}
                >
                  <Icon className="mr-3 h-6 w-6" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-sidebar-border p-4">
          <div className="flex-shrink-0 w-full group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex h-8 w-8 rounded-full items-center justify-center bg-gray-300 text-gray-800">
                  {user?.name?.charAt(0) || '?'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                  <p className="text-xs font-medium text-gray-300">{user?.role === 'hr_admin' ? 'HR Manager' : user?.role}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
