import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  return {
    user: user || undefined,
    isLoading,
    isAuthenticated: !!user,
    error: error && (error as Error).message.includes("401") ? null : error,
  };
}
