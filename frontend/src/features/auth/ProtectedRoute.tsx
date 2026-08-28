import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute() {
  const { mode } = useAuth();

  if (mode === 'UNAUTHENTICATED') {
    return <Navigate to="/login" replace />;
  }

  // If AUTHENTICATED or DEMO, allow access to /app routes
  return <Outlet />;
}
