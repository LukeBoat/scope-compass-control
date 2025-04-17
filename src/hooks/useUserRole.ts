import { useAuth } from '@/hooks/useAuth';

export function useUserRole() {
  const { user, isAdmin, isLoading } = useAuth();

  return {
    isAdmin,
    isLoading,
    isAuthenticated: !!user,
    role: isAdmin ? 'admin' : 'user'
  };
} 