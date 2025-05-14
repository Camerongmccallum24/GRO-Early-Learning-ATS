import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook for Replit authentication
 * Uses TanStack Query to fetch the authenticated user
 */
export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logout = () => {
    window.location.href = "/api/logout";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}