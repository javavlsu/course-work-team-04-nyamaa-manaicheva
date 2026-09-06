import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import AppSidebar from "../../../components/layout/AppSidebar";
import * as kanbanApi from "../../../api/kanban.js";
import Topbar from "./Topbar";
import KanbanBoard from "./KanbanBoard";
import ConfirmDialog from "./ConfirmDialog";
import "./KanbanBoardPage.css";

export function KanbanBoardPage() {
  const { collapsed, onToggleSidebar } = useOutletContext();

  const [board, setBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showArchived, setShowArchived] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [deletingColumn, setDeletingColumn] = useState(null); // колонка, ожидающая подтверждения
  const [deletingTask, setDeletingTask] = useState(null);

  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);
  const [dragOverTaskId, setDragOverTaskId] = useState(null);

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

  // ─── Drag & drop ────────────────────────────────────────────────────

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

  return (
    <>
      <AppSidebar active="kanban" collapsed={collapsed} onToggle={onToggleSidebar} />
      <div className="main">
        <Topbar
          showArchived={showArchived}
          onToggleShowArchived={() => setShowArchived((v) => !v)}
          onAddColumn={() => setIsAddingColumn(true)}
        />

        {isLoading && (
          <div className="notes-loading">
            <div className="notes-loading-spinner" />
            <span>Загрузка доски…</span>
          </div>
        )}

        {!isLoading && error && !board && (
          <div className="notes-error">
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={loadBoard}>
              Попробовать снова
            </button>
          </div>
        )}

        {!isLoading && board && (
          <>
            {error && (
              <div className="kanban-action-error" role="alert">
                <span>{error}</span>
                <button type="button" onClick={() => setError(null)}>Скрыть</button>
              </div>
            )}

            {board.columns.length === 0 && !isAddingColumn && (
              <div className="empty-state">
                <p>На доске пока нет колонок. Добавьте первую, чтобы начать.</p>
              </div>
            )}

            <KanbanBoard
              columns={board.columns}
              showArchived={showArchived}
              isAddingColumn={isAddingColumn}
              onCancelAddColumn={() => setIsAddingColumn(false)}
              onCreateColumn={handleCreateColumn}
              draggingTaskId={draggingTaskId}
              dragOverColumnId={dragOverColumnId}
              dragOverTaskId={dragOverTaskId}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onColumnDragOver={handleColumnDragOver}
              onDragLeave={handleDragLeave}
              onColumnDrop={handleColumnDrop}
              onCardDragOver={handleCardDragOver}
              onCardDrop={handleCardDrop}
              onRenameColumn={handleRenameColumn}
              onDeleteColumn={setDeletingColumn}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={setDeletingTask}
              onToggleArchiveTask={handleToggleArchive}
            />
          </>
        )}
      </div>

      {deletingColumn && (
        <ConfirmDialog
          title="Удалить колонку"
          text={`Колонка «${deletingColumn.title}» и все задачи в ней (${deletingColumn.tasks.length}) будут удалены без возможности восстановления.`}
          confirmLabel="Удалить"
          onCancel={() => setDeletingColumn(null)}
          onConfirm={confirmDeleteColumn}
        />
      )}

      {deletingTask && (
        <ConfirmDialog
          title="Удалить задачу"
          text={`Задача «${deletingTask.title}» будет удалена без возможности восстановления.`}
          confirmLabel="Удалить"
          onCancel={() => setDeletingTask(null)}
          onConfirm={confirmDeleteTask}
        />
      )}
    </>
  );
}
