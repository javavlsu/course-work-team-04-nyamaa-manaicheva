import { useState } from "react";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";

import KanbanCard from "./KanbanCard";

function KanbanColumn({
  column,
  showArchived,
  draggingTaskId,
  dragOverColumnId,
  dragOverTaskId,
  onDragStart,
  onDragEnd,
  onColumnDragOver,
  onDragLeave,
  onColumnDrop,
  onCardDragOver,
  onCardDrop,
  onRenameColumn,
  onDeleteColumn,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleArchiveTask,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskDraft, setTaskDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleTasks = showArchived ? column.tasks : column.tasks.filter((t) => !t.archived);

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    setIsEditingTitle(false);
    if (trimmed && trimmed !== column.title) {
      onRenameColumn(column.id, trimmed);
    } else {
      setTitleDraft(column.title);
    }
  };

  const commitTask = () => {
    const trimmed = taskDraft.trim();
    setIsAddingTask(false);
    setTaskDraft("");
    if (trimmed) {
      onAddTask(column.id, trimmed);
    }
  };

  return (
    <div className="kanban-column">
      <div className="column-header">
        <div className="column-header-left">
          {isEditingTitle ? (
            <input
              className="column-title-input"
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  setTitleDraft(column.title);
                  setIsEditingTitle(false);
                }
              }}
            />
          ) : (
            <span className="column-title" onClick={() => setIsEditingTitle(true)}>
              {column.title}
            </span>
          )}
          <span className="column-count">{visibleTasks.length}</span>
        </div>
        <div className="column-header-menu">
          <button
            className="btn btn-ghost"
            style={{ padding: "4px" }}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreHorizontal strokeWidth={1.6} size={16} />
          </button>
          {menuOpen && (
            <div className="column-menu" onMouseLeave={() => setMenuOpen(false)}>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteColumn(column);
                }}
              >
                <Trash2 size={14} strokeWidth={1.8} />
                Удалить колонку
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={dragOverColumnId === column.id ? "column-body drag-over" : "column-body"}
        onDragOver={(e) => onColumnDragOver(e, column.id)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onColumnDrop(e, column.id)}
      >
        {visibleTasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            dragging={draggingTaskId === task.id}
            dragOverTask={dragOverTaskId === task.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onCardDragOver={onCardDragOver}
            onCardDrop={(e, taskId) => onCardDrop(e, column.id, taskId)}
            onSave={(patch) => onUpdateTask(task.id, patch)}
            onDelete={onDeleteTask}
            onToggleArchive={onToggleArchiveTask}
          />
        ))}
      </div>

      <div className="column-footer">
        {isAddingTask ? (
          <input
            className="add-task-input"
            autoFocus
            placeholder="Название задачи…"
            value={taskDraft}
            onChange={(e) => setTaskDraft(e.target.value)}
            onBlur={commitTask}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setTaskDraft("");
                setIsAddingTask(false);
              }
            }}
          />
        ) : (
          <button className="add-card-btn" onClick={() => setIsAddingTask(true)}>
            <Plus strokeWidth={1.6} />
            Добавить задачу
          </button>
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;
