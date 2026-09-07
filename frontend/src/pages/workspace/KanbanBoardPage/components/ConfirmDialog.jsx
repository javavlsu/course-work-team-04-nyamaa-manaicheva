import { useEffect } from "react";
import "../KanbanBoardPage.css";

/**
 * Универсальная модалка подтверждения деструктивного действия (удаление колонки/задачи).
 * Повторяет паттерн PurgeConfirmModal из pages/TrashPage, но обобщена под заголовок/текст,
 * т.к. используется для двух разных сущностей на этой странице.
 */
function ConfirmDialog({ title, text, confirmLabel = "Удалить", isBusy = false, onCancel, onConfirm }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !isBusy) onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel, isBusy]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isBusy) onCancel();
  };

  return (
    <div className="kanban-modal-overlay" onClick={handleOverlayClick}>
      <div className="kanban-modal" role="dialog" aria-modal="true" aria-label={title}>
        <h3 className="kanban-modal-title">{title}</h3>
        <div className="kanban-modal-body">
          <p className="kanban-modal-text">{text}</p>
        </div>
        <div className="kanban-modal-actions">
          <button type="button" className="kanban-modal-cancel" onClick={onCancel} disabled={isBusy}>
            Отмена
          </button>
          <button type="button" className="kanban-modal-danger" onClick={onConfirm} disabled={isBusy}>
            {isBusy ? "Удаление…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
