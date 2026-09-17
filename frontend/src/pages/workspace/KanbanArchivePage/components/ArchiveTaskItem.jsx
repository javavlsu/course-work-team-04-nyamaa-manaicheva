import { ArchiveRestore, Trash2 } from "lucide-react";

import { formatDateTime } from "../../NoteEditorPage/utils.js";

function ArchiveTaskItem({ task, restoring, onRestore, onDeleteRequest }) {
  const createdAt = formatDateTime(task.createdAt);
  const updatedAt = formatDateTime(task.updatedAt);

  return (
    <div className="kanban-archive-item">
      <div className="kanban-archive-item-main">
        <span className="kanban-archive-item-title">{task.title}</span>
        {task.description && (
          <p className="kanban-archive-item-desc">{task.description}</p>
        )}
        <div className="kanban-archive-item-dates">
          {createdAt && <span>Создано: {createdAt}</span>}
          {updatedAt && <span>Изменено: {updatedAt}</span>}
        </div>
      </div>
      <div className="kanban-archive-item-actions">
        <button
          type="button"
          className="kanban-archive-action-btn"
          disabled={restoring}
          onClick={onRestore}
        >
          <ArchiveRestore size={15} strokeWidth={1.8} />
          <span>{restoring ? "Восстановление…" : "Восстановить"}</span>
        </button>
        <button
          type="button"
          className="kanban-archive-action-btn kanban-archive-action-btn-danger"
          disabled={restoring}
          onClick={onDeleteRequest}
        >
          <Trash2 size={15} strokeWidth={1.8} />
          <span>Удалить</span>
        </button>
      </div>
    </div>
  );
}

export default ArchiveTaskItem;