import { Link } from "react-router-dom";
import {
  Calendar,
  ChartNoAxesColumn,
  FileText,
  Folder,
  Menu,
  Settings,
  SquareKanban,
  Star,
  Trash,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext.jsx";
import "./AppSidebar.css";

const DEFAULT_MODULES = { kanban: true, calendar: true, analytics: true };
const MODULES_STORAGE_KEY = "nb-modules";

function readStoredModules() {
  try {
    const raw = localStorage.getItem(MODULES_STORAGE_KEY);
    if (!raw) return DEFAULT_MODULES;
    const parsed = JSON.parse(raw);
    const modules = { ...DEFAULT_MODULES };
    for (const key of ["kanban", "calendar", "analytics"]) {
      if (typeof parsed[key] === "boolean") {
        modules[key] = parsed[key];
      }
    }
    return modules;
  } catch {
    return DEFAULT_MODULES;
  }
}

function AppSidebar({
  active,
  counts = {},
  collapsed,
  onToggle,
  modules,
  onSelectAll,
  onSelectFavorites,
}) {
  const { currentUser, logout } = useAuth();
  const resolvedModules = modules ?? readStoredModules();
  const linkClass = (key) => (active === key ? "sidebar-link active" : "sidebar-link");
  const modClass = (key) => (!resolvedModules[key] ? " disabled" : "");

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
          <Menu strokeWidth={1.8} aria-hidden="true" />
        </button>
        <span>NotesBook</span>
      </div>
      <div className="sidebar-scroll">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Основные</div>
          <Link to="/" className={linkClass("notes")} onClick={onSelectAll}>
            <FileText strokeWidth={1.6} />
            <span className="link-label">Все заметки</span>
            {counts.all !== undefined && <span className="count">{counts.all}</span>}
          </Link>
          <Link to="/directories" className={linkClass("directories")}>
            <Folder strokeWidth={1.6} />
            <span className="link-label">Директории</span>
            {counts.directories !== undefined && <span className="count">{counts.directories}</span>}
          </Link>
          <a
            href="#"
            className={linkClass("favorites")}
            onClick={(e) => {
              e.preventDefault();
              onSelectFavorites?.();
            }}
          >
            <Star strokeWidth={1.6} fill="none" aria-hidden="true" />
            <span className="link-label">Избранное</span>
            {counts.favorites !== undefined && (
              <span className="count">{counts.favorites}</span>
            )}
          </a>
          <Link to="/trash" className={linkClass("trash")}>
            <Trash strokeWidth={1.6} />
            <span className="link-label">Корзина</span>
          </Link>
        </div>

        <div className="sidebar-divider"></div>
        <div className="sidebar-section">
          <div className="sidebar-section-title">Модули</div>
          <Link to="/kanban" className={linkClass("kanban") + modClass("kanban")}>
            <SquareKanban strokeWidth={1.6} aria-hidden="true" />
            <span className="link-label">Канбан</span>
          </Link>
          <Link to="/calendar" className={linkClass("calendar") + modClass("calendar")}>
            <Calendar strokeWidth={1.6} aria-hidden="true" />
            <span className="link-label">Календарь</span>
          </Link>
          <Link to="/analytics" className={linkClass("analytics") + modClass("analytics")}>
            <ChartNoAxesColumn strokeWidth={1.6} aria-hidden="true" />
            <span className="link-label">Аналитика</span>
          </Link>
        </div>
      </div>
      <div className="sidebar-footer">
        <Link to="/settings" className={linkClass("settings")} style={{ padding: "8px 8px" }}>
          <Settings strokeWidth={1.6} aria-hidden="true" />
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
