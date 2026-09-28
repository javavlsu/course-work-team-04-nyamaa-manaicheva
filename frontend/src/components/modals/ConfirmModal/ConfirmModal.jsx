import { useEffect } from "react";
import "./ConfirmModal.css";

function ConfirmModal({
  open,
  title = "Подтверждение",
  message,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  variant = "danger",
  isProcessing = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (e) => {
      if (e.key === "Escape" && !isProcessing) {
        onCancel();
      }
      if (e.key === "Enter" && !isProcessing) {
        onConfirm();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, isProcessing, onCancel, onConfirm]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onCancel();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
        <h3 id="confirm-modal-title" className="confirm-modal-title">
          {title}
        </h3>
        <div className="confirm-modal-body">
          <p className="confirm-modal-message">{message}</p>
        </div>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-cancel"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`confirm-modal-confirm confirm-modal-${variant}`}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "Выполняется…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
