import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Защита маршрутов.
 *
 * - не авторизован → /login (с запоминанием исходной страницы);
 * - `allowedRoles` задан, а роль пользователя в списке отсутствует → /403.
 *   Так администратор не попадает на клиентские страницы, а клиент — в админ-панель.
 *
 * Это защита интерфейса; реальные права проверяет backend (SecurityConfig).
 *
 * @param {{ allowedRoles?: string[] }} props
 */
export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const location = useLocation();

  // Ждём завершения начальной проверки сессии — не делаем flash redirect
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    // state.from позволит вернуть пользователя на исходную страницу после логина
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
