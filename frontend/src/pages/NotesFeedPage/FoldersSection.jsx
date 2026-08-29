import { ChevronRight, Plus } from "lucide-react";

import { FolderFillIcon } from "./icons";

function FoldersSection({ folders, activeFolder, counts, onSelect, onAdd }) {
  return (
    <div className="folders-section">
      <div className="folders-header">
        <span className="folders-title">Папки</span>
        <button className="folders-add" id="add-folder-btn" onClick={onAdd}>
          <Plus />
          Новая папка
        </button>
      </div>
      <div className="folders-list">
        {folders.map((folder) => (
          <button
            key={folder.key}
            className={`folder-row${folder.key === activeFolder ? " active" : ""}`}
            data-folder={folder.key}
            onClick={() => onSelect(folder.key)}
          >
            <span className={`folder-icon ${folder.tint}`}>
              <FolderFillIcon />
            </span>
            <span className="folder-name">{folder.name}</span>
            <span className="folder-count">{counts[folder.key] || 0}</span>
            <ChevronRight className="folder-chevron" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default FoldersSection;
