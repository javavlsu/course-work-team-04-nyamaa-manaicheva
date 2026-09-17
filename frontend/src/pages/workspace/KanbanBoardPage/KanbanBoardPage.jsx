import { useLayoutEffect } from "react";
import { useOutletContext } from "react-router-dom";

import { useKanbanBoard } from "./hooks/useKanbanBoard";
import { useKanbanDnd } from "./hooks/useKanbanDnd";
import Topbar from "./components/Topbar";
import KanbanBoard from "./components/KanbanBoard";
import ConfirmDialog from "./components/ConfirmDialog";
import "./KanbanBoardPage.css";

export function KanbanBoardPage() {
  const { setSidebarProps } = useOutletContext();

  useLayoutEffect(() => {
    setSidebarProps({ active: "kanban" });
  }, [setSidebarProps]);

  const {
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
  } = useKanbanBoard();

  const {
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
  } = useKanbanDnd(board, moveTask);

  return (
    <>
      <Topbar onAddColumn={() => setIsAddingColumn(true)} />

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
              showArchived={false}
              isAddingColumn={isAddingColumn}
              onCancelAddColumn={() => setIsAddingColumn(false)}
              onCreateColumn={handleCreateColumn}
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
              onRenameColumn={handleRenameColumn}
              onDeleteColumn={setDeletingColumn}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={setDeletingTask}
              onToggleArchiveTask={handleToggleArchive}
            />
          </>
        )}

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
