import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { isAdmin } from "../lib/utils/roles.js";

export function PublicRoute() {
  const { isAuthenticated, isLoading, currentUser } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    // Уже авторизованного администратора ведём в его панель, клиента — в рабочую область
    return <Navigate to={isAdmin(currentUser) ? "/admin/users" : "/"} replace />;
  }

  return <Outlet />;
}
