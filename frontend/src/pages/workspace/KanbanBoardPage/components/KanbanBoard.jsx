import { useState } from "react";
import { Plus, X } from "lucide-react";

import KanbanColumn from "./KanbanColumn";

function KanbanBoard({
  columns,
  showArchived,
  isAddingColumn,
  onCancelAddColumn,
  onCreateColumn,
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
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const commitNewColumn = () => {
    const trimmed = newColumnTitle.trim();
    setNewColumnTitle("");
    if (trimmed) {
      onCreateColumn(trimmed);
    } else {
      onCancelAddColumn();
    }
  };

  return (
    <div className="kanban-board">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          showArchived={showArchived}
          draggingTaskId={draggingTaskId}
          dragOverColumnId={dragOverColumnId}
          dragOverTaskId={dragOverTaskId}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onColumnDragOver={onColumnDragOver}
          onDragLeave={onDragLeave}
          onColumnDrop={onColumnDrop}
          onCardDragOver={onCardDragOver}
          onCardDrop={onCardDrop}
          onRenameColumn={onRenameColumn}
          onDeleteColumn={onDeleteColumn}
          onAddTask={onAddTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onToggleArchiveTask={onToggleArchiveTask}
        />
      ))}

      {isAddingColumn && (
        <div className="kanban-column kanban-column-new">
          <div className="column-header">
            <input
              className="column-title-input"
              autoFocus
              placeholder="Название колонки…"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitNewColumn();
                if (e.key === "Escape") {
                  setNewColumnTitle("");
                  onCancelAddColumn();
                }
              }}
            />
            <button
              className="btn btn-ghost"
              style={{ padding: "4px" }}
              onClick={() => {
                setNewColumnTitle("");
                onCancelAddColumn();
              }}
            >
              <X size={16} strokeWidth={1.6} />
            </button>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={commitNewColumn}
            >
              <Plus size={14} strokeWidth={1.8} />
              Добавить колонку
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default KanbanBoard;
