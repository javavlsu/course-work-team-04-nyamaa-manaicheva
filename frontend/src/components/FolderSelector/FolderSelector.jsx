import { useEffect, useRef } from "react";
import { Folder, Plus } from "lucide-react";
import "./FolderSelector.css";

function FolderSelector({ folders, currentFolderId, onSelect, onCreate, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="folder-selector-overlay" onClick={handleOverlayClick}>
      <div className="folder-selector-modal" ref={modalRef} role="dialog" aria-modal="true">
        <h3 className="folder-selector-title">Выберите папку</h3>
        <ul className="folder-selector-list">
          {folders.length === 0 && (
            <li className="folder-selector-empty">Папок нет</li>
          )}
          {folders.map((folder) => {
            const isCurrent = String(folder.id) === String(currentFolderId);
            return (
              <li
                key={folder.id}
                className={`folder-selector-item${isCurrent ? " current" : ""}`}
                onClick={() => {
                  if (!isCurrent) onSelect(folder.id);
                }}
              >
                <span className={`folder-selector-icon ${folder.tint || ""}`}>
                  <Folder size={16} />
                </span>
                <span className="folder-selector-name">{folder.name}</span>
                <span className="folder-selector-count">{folder.notesCount ?? 0}</span>
                {isCurrent && <span className="folder-selector-badge">текущая</span>}
              </li>
            );
          })}
        </ul>
        <div className="folder-selector-actions">
          <button className="folder-selector-create" onClick={onCreate}>
            <Plus size={14} />
            Создать новую папку
          </button>
          <button className="folder-selector-cancel" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

export default FolderSelector;
