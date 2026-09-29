import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
