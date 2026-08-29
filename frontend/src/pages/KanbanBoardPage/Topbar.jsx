import { Plus } from "lucide-react";

import { FolderIcon } from "./icons";

function Topbar() {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">Канбан-доска</span>
      </div>
      <div className="topbar-right">
        <button className="btn btn-secondary">
          <FolderIcon />
          Рабочие задачи
        </button>
        <button className="btn btn-primary">
          <Plus strokeWidth={1.6} />
          Добавить колонку
        </button>
      </div>
    </div>
  );
}

export default Topbar;
