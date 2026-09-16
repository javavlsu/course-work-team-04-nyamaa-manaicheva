import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Ждём завершения начальной проверки сессии — не делаем flash redirect
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    // state.from позволит вернуть пользователя на исходную страницу после логина
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}