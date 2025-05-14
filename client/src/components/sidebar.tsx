import { Link, useLocation } from "wouter";
import {
  BarChart3Icon,
  BriefcaseIcon,
  ClipboardListIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

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
      name: "Settings",
      href: "/settings",
      icon: (props) => (
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
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex h-screen flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-[#FFFFFF] px-5">
        <div className="flex h-16 shrink-0 items-center justify-start space-x-2">
            <img src="/uploads/OIP.jpeg" alt="GRO Logo" className="h-10 w-10 rounded-lg object-cover" />
            <h1 className="text-xl font-semibold text-gray-900">GRO ATS</h1>
          </div>
        <nav className="mt-5 flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>
                  <div
                    className={cn(
                      item.active
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      "group flex gap-x-3 rounded-md p-3 text-sm font-semibold cursor-pointer"
                    )}
                  >
                    <item.icon
                      className={cn(
                        item.active ? "text-white" : "text-gray-500 group-hover:text-gray-900",
                        "h-5 w-5 shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto pb-5">
            <div className="mb-3">
              {user && (
                <div className="flex items-center gap-2 p-3">
                  {user.profileImageUrl && (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email || 'GRO Staff'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.email || ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={logout}
              className="group flex w-full items-center gap-x-3 rounded-md p-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOutIcon
                className="h-5 w-5 shrink-0 text-gray-500 group-hover:text-gray-900"
                aria-hidden="true"
              />
              Log Out
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}