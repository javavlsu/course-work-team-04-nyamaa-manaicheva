import { useState } from "react";
import { Archive, ArchiveRestore, Pencil, Trash2 } from "lucide-react";

// Статус задачи (KanbanTaskStatus) — самостоятельное поле, отдельное от колонки.
// dotClass переиспользует уже существующие цветовые классы .todo/.progress/.done.
const STATUS_META = {
  Todo: { label: "К выполнению", dotClass: "todo" },
  InProgress: { label: "В работе", dotClass: "progress" },
  Done: { label: "Готово", dotClass: "done" },
};

function KanbanCard({
  task,
  dragging,
  dragOverTask,
  disabled,
  onDragStart,
  onDragEnd,
  onCardDragOver,
  onCardDrop,
  onSave,
  onDelete,
  onToggleArchive,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState(task.status);

  const startEdit = () => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const save = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      cancelEdit();
      return;
    }
    onSave({
      title: trimmedTitle !== task.title ? trimmedTitle : undefined,
      description: description !== (task.description ?? "") ? description : undefined,
      status: status !== task.status ? status : undefined,
    });
    setIsEditing(false);
  };

  const meta = STATUS_META[task.status] ?? STATUS_META.Todo;

  if (isEditing) {
    return (
      <div className="kanban-card kanban-card-editing">
        <input
          className="kanban-card-title-input"
          type="text"
          autoFocus
          placeholder="Название задачи…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="kanban-card-description-input"
          placeholder="Описание (необязательно)…"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          className="kanban-card-status-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {Object.entries(STATUS_META).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <div className="kanban-card-edit-actions">
          <button type="button" className="kanban-card-btn-cancel" onClick={cancelEdit}>
            Отмена
          </button>
          <button type="button" className="kanban-card-btn-save" onClick={save}>
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "kanban-card",
        dragging ? "dragging" : "",
        task.archived ? "archived" : "",
        dragOverTask ? "drag-over-card" : "",
      ].filter(Boolean).join(" ")}
      draggable={!disabled}
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onCardDragOver(e, task.id)}
      onDrop={(e) => onCardDrop(e, task.id)}
    >
      <div className="kanban-card-top">
        <span className="kanban-card-title" onClick={startEdit}>{task.title}</span>
        <div className="kanban-card-actions">
          <button type="button" className="kanban-card-icon-btn" title="Редактировать" onClick={startEdit}>
            <Pencil size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="kanban-card-icon-btn"
            title={task.archived ? "Вернуть из архива" : "В архив"}
            onClick={() => onToggleArchive(task)}
          >
            {task.archived
              ? <ArchiveRestore size={13} strokeWidth={1.8} />
              : <Archive size={13} strokeWidth={1.8} />}
          </button>
          <button
            type="button"
            className="kanban-card-icon-btn kanban-card-icon-btn-danger"
            title="Удалить"
            onClick={() => onDelete(task)}
          >
            <Trash2 size={13} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {task.description && <p className="kanban-card-description">{task.description}</p>}

      <div className="kanban-card-meta">
        <span className={`kanban-card-tag ${meta.dotClass}`}>{meta.label}</span>
        {task.archived && <span className="kanban-card-archived-badge">В архиве</span>}
      </div>
    </div>
  );
}

export default KanbanCard;
