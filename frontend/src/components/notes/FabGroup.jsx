import { useState } from "react";
import { Download, Plus } from "lucide-react";

import NoteTemplateModal from "@/components/modals/NoteTemplateModal";

function FabGroup({ onNewFolder }) {
  const [templateOpen, setTemplateOpen] = useState(false);

  return (
    <>
      <div className="fab-group">
        <button className="fab fab-secondary" title="Импорт">
          <Download />
          <span className="fab-label">Импорт</span>
        </button>
        <button
          className="fab fab-primary fab-main"
          title="Создать..."
          aria-label="Создать..."
          onClick={() => setTemplateOpen(true)}
        >
          <Plus strokeWidth={2.2} />
        </button>
      </div>
      {templateOpen && (
        <NoteTemplateModal
          open
          onClose={() => setTemplateOpen(false)}
          onCreateDirectory={onNewFolder}
        />
      )}
    </>
  );
}

export default FabGroup;