import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Sin sesión no se puede ver ninguna pantalla interna, requiere siempre requiredpermission
export function ProtectedRoute({ requiredPermission }: { requiredPermission?: string }) {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard/sla" replace />;
  }

  return <Outlet />;
}
