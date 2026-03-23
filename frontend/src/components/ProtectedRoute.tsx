/**
 * Protected route component - redirects to login if not authenticated
 * Optionally checks module-level view permission
 */
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: string;
}

export default function ProtectedRoute({ children, module }: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (module && !hasPermission(module, 'view')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
