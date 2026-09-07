import { useCallback, useEffect, useState } from "react";

import * as kanbanApi from "../../../../api/kanban.js";

export function useKanbanBoard() {
  const [board, setBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deletingColumn, setDeletingColumn] = useState(null); // колонка, ожидающая подтверждения
  const [deletingTask, setDeletingTask] = useState(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const loadBoard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await kanbanApi.getMyBoard();
      setBoard(data);
    } catch (err) {
      setError(err.message || "Не удалось загрузить доску");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const applyTaskUpdate = (updatedTask) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => ({
        ...c,
        tasks: c.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
      })),
    }));
  };

  // ─── Columns ────────────────────────────────────────────────────────

  const handleCreateColumn = async (title) => {
    if (!board) return;
    setIsAddingColumn(false);
    try {
      const column = await kanbanApi.createColumn(board.id, { title });
      setBoard((prev) => ({ ...prev, columns: [...prev.columns, column] }));
    } catch (err) {
      setError(err.message || "Не удалось создать колонку");
    }
  };

  const handleRenameColumn = async (columnId, title) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.id === columnId ? { ...c, title } : c)),
    }));
    try {
      await kanbanApi.updateColumn(columnId, { title });
    } catch (err) {
      setError(err.message || "Не удалось переименовать колонку");
      loadBoard(); // откат — проще перезагрузить доску целиком
    }
  };

  const confirmDeleteColumn = async () => {
    if (!deletingColumn) return;
    const columnId = deletingColumn.id;
    setDeletingColumn(null);
    try {
      await kanbanApi.deleteColumn(columnId);
      setBoard((prev) => ({ ...prev, columns: prev.columns.filter((c) => c.id !== columnId) }));
    } catch (err) {
      setError(err.message || "Не удалось удалить колонку");
    }
  };

  // ─── Tasks ──────────────────────────────────────────────────────────

  const handleAddTask = async (columnId, title) => {
    try {
      const task = await kanbanApi.createTask(columnId, { title });
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((c) => (c.id === columnId ? { ...c, tasks: [...c.tasks, task] } : c)),
      }));
    } catch (err) {
      setError(err.message || "Не удалось создать задачу");
    }
  };

  const handleUpdateTask = async (taskId, patch) => {
    const hasChanges = Object.values(patch).some((v) => v !== undefined);
    if (!hasChanges) return;
    try {
      const updated = await kanbanApi.updateTask(taskId, patch);
      applyTaskUpdate(updated);
    } catch (err) {
      setError(err.message || "Не удалось обновить задачу");
    }
  };

  const confirmDeleteTask = async () => {
    if (!deletingTask) return;
    const taskId = deletingTask.id;
    setDeletingTask(null);
    try {
      await kanbanApi.deleteTask(taskId);
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((c) => ({ ...c, tasks: c.tasks.filter((t) => t.id !== taskId) })),
      }));
    } catch (err) {
      setError(err.message || "Не удалось удалить задачу");
    }
  };

  const handleToggleArchive = async (task) => {
    try {
      const updated = task.archived
        ? await kanbanApi.unarchiveTask(task.id)
        : await kanbanApi.archiveTask(task.id);
      applyTaskUpdate(updated);
    } catch (err) {
      setError(err.message || "Не удалось изменить архивный статус задачи");
    }
  };

  // Общий перенос: targetColumnId — целевая колонка, position (null = в конец).
  // position считается индексом среди задач целевой колонки БЕЗ самой переносимой —
  // ровно так же его трактует backend (MoveTask), поэтому опережающий локальный
  // расчёт совпадает с тем, что вернётся после запроса.
  const moveTask = async (taskId, targetColumnId, position) => {
    if (!board) return;

    const sourceColumn = board.columns.find((c) => c.tasks.some((t) => t.id === taskId));
    if (!sourceColumn) return;
    const task = sourceColumn.tasks.find((t) => t.id === taskId);

    const targetColumnTasks = sourceColumn.id === targetColumnId
      ? sourceColumn.tasks
      : board.columns.find((c) => c.id === targetColumnId)?.tasks ?? [];
    const remainingInTarget = targetColumnTasks.filter((t) => t.id !== taskId);
    const targetIndex = position != null ? Math.min(position, remainingInTarget.length) : remainingInTarget.length;
    const currentIndex = sourceColumn.id === targetColumnId
      ? sourceColumn.tasks.findIndex((t) => t.id === taskId)
      : -1;

    // Отпустили карточку туда же, откуда взяли — запрос не нужен.
    if (sourceColumn.id === targetColumnId && targetIndex === currentIndex) return;

    // Оптимистичное обновление порядка в UI, не дожидаясь ответа backend.
    setBoard((prev) => {
      const columns = prev.columns.map((c) => ({ ...c, tasks: [...c.tasks] }));
      const srcCol = columns.find((c) => c.id === sourceColumn.id);
      srcCol.tasks = srcCol.tasks.filter((t) => t.id !== taskId);
      const dstCol = columns.find((c) => c.id === targetColumnId);
      const insertAt = position != null ? Math.min(position, dstCol.tasks.length) : dstCol.tasks.length;
      dstCol.tasks.splice(insertAt, 0, task);
      return { ...prev, columns };
    });

    try {
      const updatedTask = await kanbanApi.moveTask(taskId, { targetColumnId, position });
      applyTaskUpdate(updatedTask);
    } catch (err) {
      setError(err.message || "Не удалось перенести задачу");
      loadBoard(); // откат — проще перезагрузить доску целиком
    }
  };

  return {
    board,
    isLoading,
    error,
    setError,
    deletingColumn,
    setDeletingColumn,
    deletingTask,
    setDeletingTask,
    isAddingColumn,
    setIsAddingColumn,
    loadBoard,
    handleCreateColumn,
    handleRenameColumn,
    confirmDeleteColumn,
    handleAddTask,
    handleUpdateTask,
    confirmDeleteTask,
    handleToggleArchive,
    moveTask,
  };
}
