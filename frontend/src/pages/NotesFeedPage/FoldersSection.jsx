import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";

import { FolderFillIcon } from "./icons";

function FoldersSection({
  folders,
  activeFolder,
  counts,
  onSelect,
  onAdd,
  isCreating = false,
  onRename,
  onDelete,
  renamingFolderId = null,
  deletingFolderId = null,
}) {
  return (
    <div className="folders-section">
      <div className="folders-header">
        <span className="folders-title">Папки</span>
        <button
          className="folders-add"
          id="add-folder-btn"
          onClick={onAdd}
          disabled={isCreating}
        >
          <Plus />
          {isCreating ? "Создание…" : "Новая папка"}
        </button>
      </div>
      <div className="folders-list">
        {folders.map((folder) => {
          const isSystemFolder = folder.key === "all";
          const isBusy = renamingFolderId === folder.key || deletingFolderId === folder.key;
          return (
            <div
              key={folder.key}
              className={`folder-row${folder.key === activeFolder ? " active" : ""}`}
              data-folder={folder.key}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(folder.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(folder.key);
                }
              }}
            >
              <span className={`folder-icon ${folder.tint}`}>
                <FolderFillIcon />
              </span>
              <span className="folder-name">{folder.name}</span>
              <span className="folder-count">{counts[folder.key] || 0}</span>
              {!isSystemFolder && (
                <div className="folder-actions">
                  <button
                    className="folder-action-btn"
                    title="Переименовать"
                    disabled={isBusy}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRename?.(folder);
                    }}
                  >
                    <Pencil strokeWidth={1.6} />
                  </button>
                  <button
                    className="folder-action-btn"
                    title="Удалить"
                    disabled={isBusy}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(folder);
                    }}
                  >
                    <Trash2 strokeWidth={1.6} />
                  </button>
                </div>
              )}
              <ChevronRight className="folder-chevron" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FoldersSection;
