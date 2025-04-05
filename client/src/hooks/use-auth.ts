import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '../lib/queryClient';
import { useToast } from './use-toast';

// Define user type
export type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'subadmin' | 'player';
  wallet_balance: number;
  status?: 'active' | 'blocked';
  phone?: string;
  subadmin_id?: number;
  created_at?: Date;
};

// Define auth context type
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create auth context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => {},
  logout: async () => {},
});

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

// Auth state hook - to be used by the AuthProvider component
export function useAuthState(): AuthContextType {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  // Check if user is logged in
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        return await apiRequest<User>('/api/auth/me', { method: 'GET' });
      } catch (error) {
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
  });

  // Set user when data changes
  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      return apiRequest<User>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
    },
    onSuccess: (data) => {
      setUser(data);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.name}!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid username or password',
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      setUser(null);
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out',
        variant: 'destructive',
      });
    },
  });

  // Login function
  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return {
    user,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    login,
    logout
  };
}