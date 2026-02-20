import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isVerified } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  if (!isVerified && location.pathname !== '/verify') {
    return <Navigate to='/verify' replace />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isVerified } = useAuthStore();

  if (isAuthenticated && isVerified) {
    return <Navigate to='/dashboard' replace />;
  }

  if (isAuthenticated && !isVerified) {
    return <Navigate to='/verify' replace />;
  }

  return <>{children}</>;
}
