import { useEffect } from "react";
import "./TrashPage.css";

/**
 * Модалка подтверждения безвозвратного удаления заметки.
 * Визуально и поведенчески повторяет DeleteDirectoryModal
 * (components/DirectoryModal), но со своими CSS-классами (trash-modal-*),
 * т.к. по конвенции проекта стили модалок не выносятся в общий файл,
 * а дублируются рядом со страницей/фичей, которой принадлежат.
 */
function PurgeConfirmModal({ noteTitle, isPurging = false, onClose, onConfirm }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !isPurging) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, isPurging]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isPurging) onClose();
  };

  return (
    <div className="trash-modal-overlay" onClick={handleOverlayClick}>
      <div className="trash-modal" role="dialog" aria-modal="true" aria-label="Удалить заметку навсегда">
        <h3 className="trash-modal-title">Удалить навсегда</h3>
        <div className="trash-modal-body">
          <p className="trash-modal-text">
            Заметка «{noteTitle || "Без названия"}» будет удалена без возможности восстановления —
            вместе с вложениями, комментариями, тегами и историей версий. Это действие необратимо.
          </p>
        </div>
        <div className="trash-modal-actions">
          <button type="button" className="trash-modal-cancel" onClick={onClose} disabled={isPurging}>
            Отмена
          </button>
          <button type="button" className="trash-modal-danger" onClick={onConfirm} disabled={isPurging}>
            {isPurging ? "Удаление…" : "Удалить навсегда"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PurgeConfirmModal;
