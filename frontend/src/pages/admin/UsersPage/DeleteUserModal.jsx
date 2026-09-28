import { useEffect } from "react";

/**
 * Подтверждение удаления пользователя вместе со всеми его данными.
 */
function DeleteUserModal({ user, isDeleting = false, error, onClose, onConfirm }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !isDeleting) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, isDeleting]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isDeleting) onClose();
  };

  const fullName = `${user.name ?? ""} ${user.surname ?? ""}`.trim() || user.email;

  return (
    <div className="trash-modal-overlay" onClick={handleOverlayClick}>
      <div className="trash-modal" role="dialog" aria-modal="true" aria-label="Удалить пользователя">
        <h3 className="trash-modal-title">Удалить пользователя</h3>
        <div className="trash-modal-body">
          <p className="trash-modal-text">
            Пользователь «{fullName}» будет удалён вместе со всеми данными: заметками,
            директориями, вложениями, комментариями и доступами. Это действие необратимо.
          </p>
          {error && (
            <div className="trash-action-error admin-modal-error" role="alert">
              <span>{error}</span>
            </div>
          )}
        </div>
        <div className="trash-modal-actions">
          <button type="button" className="trash-modal-cancel" onClick={onClose} disabled={isDeleting}>
            Отмена
          </button>
          <button type="button" className="trash-modal-danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Удаление…" : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteUserModal;
