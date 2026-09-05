import { Folder, Pencil, Plus, Trash2 } from "lucide-react";

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
      <div className="folders-grid">
        {folders.map((folder) => {
          const isSystemFolder = folder.key === "all";
          const isBusy = renamingFolderId === folder.key || deletingFolderId === folder.key;
          const notesCount = folder.notesCount ?? counts?.[folder.key] ?? 0;
          return (
            <div
              key={folder.key}
              className={`folder-card${folder.key === activeFolder ? " active" : ""}`}
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
              <div className={`folder-icon ${folder.tint || ""}`}>
                <Folder size={24} />
              </div>
              <div className="folder-info">
                <h3 className="folder-title">{folder.name}</h3>
                <span className="folder-count">{notesCount} заметок</span>
              </div>
              {!isSystemFolder && (onRename || onDelete) && (
                <div className="folder-actions">
                  {onRename && (
                    <button
                      className="folder-action-btn"
                      title="Переименовать"
                      disabled={isBusy}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRename(folder);
                      }}
                    >
                      <Pencil strokeWidth={1.6} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="folder-action-btn"
                      title="Удалить"
                      disabled={isBusy}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(folder);
                      }}
                    >
                      <Trash2 strokeWidth={1.6} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FoldersSection;
