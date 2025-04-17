import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toastError } from './ToastNotification';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAdmin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        toastError("Access Denied", "Please log in to access this page");
        navigate('/login');
        return;
      }

      if (requireAdmin && user.role !== 'admin') {
        // Requires admin but user is not admin
        toastError("Access Denied", "This page requires administrator access");
        navigate('/dashboard');
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // User's role is not in allowed roles
        toastError("Access Denied", "You don't have permission to access this page");
        navigate('/dashboard');
        return;
      }
    }
  }, [user, loading, navigate, allowedRoles, requireAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
} 