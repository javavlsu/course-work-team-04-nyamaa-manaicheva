import { Archive, ArchiveRestore, Plus } from "lucide-react";

function Topbar({ showArchived, onToggleShowArchived, onAddColumn }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">Канбан-доска</span>
      </div>
      <div className="topbar-right">
        <button className="btn btn-secondary" onClick={onToggleShowArchived}>
          {showArchived ? <ArchiveRestore strokeWidth={1.6} /> : <Archive strokeWidth={1.6} />}
          {showArchived ? "Скрыть архив" : "Показать архив"}
        </button>
        <button className="btn btn-primary" onClick={onAddColumn}>
          <Plus strokeWidth={1.6} />
          Добавить колонку
        </button>
      </div>
    </div>
  );
}

export default Topbar;
