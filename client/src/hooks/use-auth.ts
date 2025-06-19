import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
}

interface AuthResponse {
  user: User;
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: authData, isLoading, error, refetch } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 0,
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      if (res.status === 401) {
        localStorage.removeItem('authToken');
        return null;
      }
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      localStorage.removeItem('authToken');
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation("/login");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    },
  });

  const isAuthenticated = !!authData?.user;
  const user = authData?.user || null;

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    isLoggingOut: logoutMutation.isPending,
    refetch,
  };
}