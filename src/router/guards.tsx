import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to='/dashboard' replace />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  return <>{children}</>;
}
