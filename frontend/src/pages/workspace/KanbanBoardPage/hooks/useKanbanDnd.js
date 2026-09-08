import { useState } from "react";

export function useKanbanDnd(board, moveTask) {
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);
  const [dragOverTaskId, setDragOverTaskId] = useState(null);

  const handleDragStart = (taskId) => setDraggingTaskId(taskId);

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColumnId(null);
    setDragOverTaskId(null);
  };

  const handleColumnDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumnId(columnId);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumnId(null);
    }
  };

  const handleCardDragOver = (e, taskId) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverTaskId(taskId);
  };

  // Отпустили карточку на пустое место в колонке (не на другую карточку) — в конец.
  const handleColumnDrop = (e, columnId) => {
    e.preventDefault();
    setDragOverColumnId(null);
    setDragOverTaskId(null);
    const taskId = draggingTaskId;
    setDraggingTaskId(null);
    if (!taskId) return;
    moveTask(taskId, columnId, null);
  };

  // Отпустили карточку на другую карточку — вставляем перед ней.
  const handleCardDrop = (e, columnId, targetTaskId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColumnId(null);
    setDragOverTaskId(null);
    const taskId = draggingTaskId;
    setDraggingTaskId(null);
    if (!taskId || taskId === targetTaskId || !board) return;

    const targetColumn = board.columns.find((c) => c.id === columnId);
    if (!targetColumn) return;
    const remaining = targetColumn.tasks.filter((t) => t.id !== taskId);
    const position = remaining.findIndex((t) => t.id === targetTaskId);
    if (position === -1) return;

    moveTask(taskId, columnId, position);
  };

  return {
    draggingTaskId,
    dragOverColumnId,
    dragOverTaskId,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onColumnDragOver: handleColumnDragOver,
    onDragLeave: handleDragLeave,
    onColumnDrop: handleColumnDrop,
    onCardDragOver: handleCardDragOver,
    onCardDrop: handleCardDrop,
  };
}
