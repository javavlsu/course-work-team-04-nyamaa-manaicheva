import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, Ellipsis, Plus } from "lucide-react";

function Topbar({ onAddColumn }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">Канбан-доска</span>
      </div>
      <div className="topbar-right">
        <div className="kanban-topbar-menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="kanban-topbar-icon-btn"
            title="Меню доски"
            aria-label="Меню доски"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Ellipsis size={18} strokeWidth={1.8} />
          </button>
          {menuOpen && (
            <div className="kanban-topbar-menu">
              <button
                type="button"
                className="kanban-topbar-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  onAddColumn();
                }}
              >
                <Plus size={14} strokeWidth={1.8} />
                Добавить колонку
              </button>
              <button
                type="button"
                className="kanban-topbar-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/kanban/archive");
                }}
              >
                <Archive size={14} strokeWidth={1.8} />
                Показать архив
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topbar;