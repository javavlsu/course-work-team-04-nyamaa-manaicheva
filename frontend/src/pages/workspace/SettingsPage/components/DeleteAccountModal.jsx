import { useEffect } from "react";

function DeleteAccountModal({ isDeleting = false, error, onClose, onConfirm }) {
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

  return (
    <div className="settings-modal-overlay" onClick={handleOverlayClick}>
      <div className="settings-modal" role="dialog" aria-modal="true" aria-label="Удалить аккаунт">
        <h3 className="settings-modal-title">Удалить аккаунт</h3>
        <div className="settings-modal-body">
          <p className="settings-modal-text">
            Аккаунт будет удалён без возможности восстановления. Это действие
            необратимо.
          </p>
          {error && (
            <div className="settings-feedback settings-feedback-error">{error}</div>
          )}
        </div>
        <div className="settings-modal-actions">
          <button
            type="button"
            className="settings-modal-cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Отмена
          </button>
          <button
            type="button"
            className="settings-modal-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Удаление…" : "Удалить аккаунт"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;