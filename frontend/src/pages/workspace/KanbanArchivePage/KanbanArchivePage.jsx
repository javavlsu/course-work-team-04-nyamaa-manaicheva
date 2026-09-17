import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Archive, ArrowLeft } from "lucide-react";

import * as kanbanApi from "../../../api/kanban.js";
import ConfirmDialog from "../KanbanBoardPage/components/ConfirmDialog";
import ArchiveTaskItem from "./components/ArchiveTaskItem";
import "./KanbanArchivePage.css";

export function KanbanArchivePage() {
  const navigate = useNavigate();
  const { setSidebarProps } = useOutletContext();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useLayoutEffect(() => {
    setSidebarProps({ active: "kanban" });
  }, [setSidebarProps]);

  const loadArchive = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await kanbanApi.getArchivedTasks();
      setTasks(items ?? []);
    } catch (err) {
      setError(err.message || "Не удалось загрузить архив");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArchive();
  }, [loadArchive]);

  const handleRestore = async (task) => {
    setRestoringId(task.id);
    setActionError(null);
    try {
      await kanbanApi.unarchiveTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      setActionError(err.message || "Не удалось восстановить задачу");
    } finally {
      setRestoringId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingTask) return;
    const taskId = deletingTask.id;
    setDeletingTask(null);
    setDeletingId(taskId);
    try {
      await kanbanApi.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      setActionError(err.message || "Не удалось удалить задачу");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="back-button"
            aria-label="Назад к доске"
            onClick={() => navigate("/kanban")}
          >
            <ArrowLeft size={20} />
          </button>
          <span className="topbar-title">Архив</span>
          {!isLoading && !error && tasks.length > 0 && (
            <span className="topbar-count">{tasks.length}</span>
          )}
        </div>
      </div>

      {actionError && (
        <div className="kanban-archive-action-error" role="alert">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError(null)}>
            Скрыть
          </button>
        </div>
      )}

      {isLoading && (
        <div className="notes-loading">
          <div className="notes-loading-spinner" />
          <span>Загрузка архива…</span>
        </div>
      )}

      {!isLoading && error && (
        <div className="notes-error">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={loadArchive}>
            Попробовать снова
          </button>
        </div>
      )}

      {!isLoading && !error && tasks.length > 0 && (
        <div className="kanban-archive-list">
          {tasks.map((task) => (
            <ArchiveTaskItem
              key={task.id}
              task={task}
              restoring={restoringId === task.id}
              onRestore={() => handleRestore(task)}
              onDeleteRequest={() => setDeletingTask(task)}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && tasks.length === 0 && (
        <div className="empty-state">
          <Archive className="kanban-archive-empty-icon" strokeWidth={1.3} aria-hidden="true" />
          <p>В архиве нет задач</p>
        </div>
      )}

      {deletingTask && (
        <ConfirmDialog
          title="Удалить задачу"
          text={`Задача «${deletingTask.title}» будет удалена без возможности восстановления.`}
          confirmLabel="Удалить"
          isBusy={deletingId === deletingTask.id}
          onCancel={() => {
            if (deletingId === null) setDeletingTask(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}