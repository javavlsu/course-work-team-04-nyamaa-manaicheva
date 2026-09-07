import { Link } from "react-router-dom";
import { Download, FolderPlus, Plus } from "lucide-react";

function FabGroup({ onNewFolder }) {
  return (
    <div className="fab-group">
      <button className="fab fab-secondary" title="Импорт">
        <Download />
        <span className="fab-label">Импорт</span>
      </button>
      {onNewFolder && (
        <button className="fab fab-primary" title="Новая папка" onClick={onNewFolder}>
          <FolderPlus strokeWidth={2} />
          <span className="fab-label">Новая папка</span>
        </button>
      )}
      <Link to="/notes/new" className="fab fab-primary" title="Новая заметка">
        <Plus strokeWidth={2.2} />
        <span className="fab-label">Новая заметка</span>
      </Link>
    </div>
  );
}

export default FabGroup;
