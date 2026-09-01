import { Link } from "react-router-dom";
import { LayoutGrid, Trash } from "lucide-react";

import {
  MenuIcon,
  StarIcon,
  KanbanIcon,
  CalendarIcon,
  AnalyticsIcon,
  SettingsIcon,
} from "./icons";
import { useAuth } from "../../../context/AuthContext.jsx";
import "./AppSidebar.css";

function AppSidebar({
  active,
  counts = {},
  collapsed,
  onToggle,
  modules = { kanban: true, calendar: true, analytics: true },
  onSelectAll,
  onSelectFavorites,
}) {
  const { currentUser, logout } = useAuth();
  const linkClass = (key) => (active === key ? "sidebar-link active" : "sidebar-link");
  const modClass = (key) => (!modules[key] ? " disabled" : "");

  // Строим имя и инициалы из данных backend (UserResponse: name, surname, email)
  const displayName = currentUser
    ? `${currentUser.name} ${currentUser.surname}`
    : "";
  const initials = currentUser
    ? `${(currentUser.name?.[0] || "").toUpperCase()}${(currentUser.surname?.[0] || "").toUpperCase()}`
    : "?";

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    // После logout ProtectedRoute перенаправит на /login автоматически
  };

  return (
    <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>
      <div className="sidebar-brand">
        <button className="hamburger-btn" title="Свернуть/развернуть меню" onClick={onToggle}>
          <MenuIcon />
        </button>
        <span>NotesBook</span>
      </div>
      <div className="sidebar-scroll">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Основные</div>
          <Link to="/notes" className={linkClass("notes")} onClick={onSelectAll}>
            <LayoutGrid strokeWidth={1.6} />
            <span className="link-label">Все заметки</span>
            {counts.all !== undefined && <span className="count">{counts.all}</span>}
          </Link>
          <a
            href="#"
            className={linkClass("favorites")}
            onClick={(e) => {
              e.preventDefault();
              onSelectFavorites?.();
            }}
          >
            <StarIcon filled={false} />
            <span className="link-label">Избранное</span>
            {counts.favorites !== undefined && (
              <span className="count">{counts.favorites}</span>
            )}
          </a>
          <a href="#" className={linkClass("trash")}>
            <Trash strokeWidth={1.6} />
            <span className="link-label">Корзина</span>
          </a>
        </div>

        <div className="sidebar-divider"></div>
        <div className="sidebar-section">
          <div className="sidebar-section-title">Модули</div>
          <Link to="/kanban" className={linkClass("kanban") + modClass("kanban")}>
            <KanbanIcon />
            <span className="link-label">Канбан</span>
          </Link>
          <a href="#" className={linkClass("calendar") + modClass("calendar")}>
            <CalendarIcon />
            <span className="link-label">Календарь</span>
          </a>
          <a href="#" className={linkClass("analytics") + modClass("analytics")}>
            <AnalyticsIcon />
            <span className="link-label">Аналитика</span>
          </a>
        </div>
      </div>
      <div className="sidebar-footer">
        <Link to="/settings" className={linkClass("settings")} style={{ padding: "8px 8px" }}>
          <SettingsIcon />
          <span className="link-label">Настройки</span>
        </Link>
        <div className="user-row" style={{ marginTop: "10px", padding: "0 8px" }}>
          <div className="avatar" title={displayName}>{initials}</div>
          <span className="link-label">{displayName}</span>
          {/* Кнопка выхода — видна только когда sidebar развёрнут */}
          <button
            className="sidebar-logout-btn"
            title="Выйти"
            onClick={handleLogout}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted, #888)",
              fontSize: "11px",
              padding: "2px 4px",
              flexShrink: 0,
            }}
          >
            Выйти
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AppSidebar;
