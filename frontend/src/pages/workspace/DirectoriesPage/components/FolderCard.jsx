import { Folder, Pencil, Trash2 } from "lucide-react";

export default function FolderCard({ folder, onClick, onRename, onDelete, isBusy = false }) {
  return (
    <div
      className="folder-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="folder-card-top">
        <div className={`folder-icon ${folder.tint || ""}`}>
          <Folder size={22} />
        </div>
        {(onRename || onDelete) && (
          <div className="folder-actions" onClick={(e) => e.stopPropagation()}>
            {onRename && (
              <button
                type="button"
                className="folder-action-btn"
                title="Изменить директорию"
                aria-label="Изменить директорию"
                disabled={isBusy}
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(folder);
                }}
              >
                <Pencil size={15} strokeWidth={1.8} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="folder-action-btn folder-action-btn-danger"
                title="Удалить директорию"
                aria-label="Удалить директорию"
                disabled={isBusy}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(folder);
                }}
              >
                <Trash2 size={15} strokeWidth={1.8} />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="folder-info">
        <h3 className="folder-title">{folder.name}</h3>
        <span className="folder-count">
          <span className="folder-count-dot" aria-hidden="true" />
          {folder.notesCount ?? 0} заметок
        </span>
      </div>
    </div>
  );
}
