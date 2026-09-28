import { Link } from "react-router-dom";
import { ChartNoAxesColumn, Menu, ScrollText, Settings, Users } from "lucide-react";

import { useAuth } from "@/context/AuthContext.jsx";
// Переиспользуем стили клиентского сайдбара — визуально панель администратора идентична
import "../AppSidebar/AppSidebar.css";

/**
 * Боковая панель администратора: Пользователи, Логи, Статистика
 * + нижний блок «Настройки / имя пользователя / выйти».
 */
function AdminSidebar({ active, collapsed, onToggle }) {
  const { currentUser, logout } = useAuth();
  const linkClass = (key) => (active === key ? "sidebar-link active" : "sidebar-link");

  const displayName = currentUser ? `${currentUser.name} ${currentUser.surname}` : "";
  const initials = currentUser
    ? `${(currentUser.name?.[0] || "").toUpperCase()}${(currentUser.surname?.[0] || "").toUpperCase()}`
    : "?";

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    // После logout ProtectedRoute перенаправит на /login
  };

  return (
    <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>
      <div className="sidebar-brand">
        <button className="hamburger-btn" title="Свернуть/развернуть меню" onClick={onToggle}>
          <Menu strokeWidth={1.8} aria-hidden="true" />
        </button>
        <span>NotesBook</span>
      </div>
      <div className="sidebar-scroll">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Администрирование</div>
          <Link to="/admin/users" className={linkClass("users")}>
            <Users strokeWidth={1.6} aria-hidden="true" />
            <span className="link-label">Пользователи</span>
          </Link>
          <Link to="/admin/logs" className={linkClass("logs")}>
            <ScrollText strokeWidth={1.6} aria-hidden="true" />
            <span className="link-label">Логи</span>
          </Link>
          <Link to="/admin/stats" className={linkClass("stats")}>
            <ChartNoAxesColumn strokeWidth={1.6} aria-hidden="true" />
            <span className="link-label">Статистика</span>
          </Link>
        </div>
      </div>
      <div className="sidebar-footer">
        <Link to="/admin/settings" className={linkClass("settings")} style={{ padding: "8px 8px" }}>
          <Settings strokeWidth={1.6} aria-hidden="true" />
          <span className="link-label">Настройки</span>
        </Link>
        <div className="user-row">
          <div className="avatar" title={displayName}>{initials}</div>
          <span className="link-label">{displayName}</span>
          <button className="sidebar-logout-btn" title="Выйти" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
