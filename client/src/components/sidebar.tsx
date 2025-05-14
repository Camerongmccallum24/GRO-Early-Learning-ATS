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
      href: "/job-postings",
      icon: BriefcaseIcon,
      active: location === "/job-postings" || location.startsWith("/job-posting/"),
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
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex h-screen flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-[#FFFFFF] px-5">
        <div className="flex h-16 shrink-0 items-center justify-start space-x-2">
          <div className="flex items-center justify-center rounded-lg bg-primary w-10 h-10">
            <span className="text-lg font-bold text-white">G</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">GRO ATS</h1>
        </div>
        <nav className="mt-5 flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      item.active
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      "group flex gap-x-3 rounded-md p-3 text-sm font-semibold"
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
                  </a>
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