import { useEffect, useRef, useState } from "react";
import "./DirectoryModal.css";

function RenameDirectoryModal({ folderName, isSaving = false, onClose, onSubmit }) {
  const [value, setValue] = useState(folderName ?? "");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, isSaving]);

  const trimmed = value.trim();
  const canSave = trimmed.length > 0 && trimmed !== (folderName ?? "").trim() && !isSaving;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSaving) onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSave) onSubmit(trimmed);
  };

  return (
    <div className="directory-modal-overlay" onClick={handleOverlayClick}>
      <div className="directory-modal" role="dialog" aria-modal="true" aria-label="Изменить директорию">
        <h3 className="directory-modal-title">Изменить директорию</h3>
        <form onSubmit={handleSubmit}>
          <div className="directory-modal-body">
            <label className="directory-modal-label" htmlFor="directory-modal-name">
              Название
            </label>
            <input
              id="directory-modal-name"
              ref={inputRef}
              className="directory-modal-input"
              value={value}
              maxLength={120}
              placeholder="Название директории"
              autoComplete="off"
              disabled={isSaving}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="directory-modal-actions">
            <button type="button" className="directory-modal-cancel" onClick={onClose} disabled={isSaving}>
              Отмена
            </button>
            <button type="submit" className="directory-modal-primary" disabled={!canSave}>
              {isSaving ? "Сохранение…" : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteDirectoryModal({ folderName, isDeleting = false, onClose, onConfirm }) {
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
    <div className="directory-modal-overlay" onClick={handleOverlayClick}>
      <div className="directory-modal" role="dialog" aria-modal="true" aria-label="Удалить директорию">
        <h3 className="directory-modal-title">Удалить директорию</h3>
        <div className="directory-modal-body">
          <p className="directory-modal-text">
            Удалить директорию «{folderName}»? Заметки внутри нее не удаляются.
          </p>
        </div>
        <div className="directory-modal-actions">
          <button type="button" className="directory-modal-cancel" onClick={onClose} disabled={isDeleting}>
            Отмена
          </button>
          <button type="button" className="directory-modal-danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Удаление…" : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateDirectoryModal({ isCreating = false, onClose, onSubmit }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !isCreating) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, isCreating]);

  const trimmed = value.trim();
  const canCreate = trimmed.length > 0 && !isCreating;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isCreating) onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canCreate) onSubmit(trimmed);
  };

  return (
    <div className="directory-modal-overlay" onClick={handleOverlayClick}>
      <div className="directory-modal" role="dialog" aria-modal="true" aria-label="Новая директория">
        <h3 className="directory-modal-title">Новая директория</h3>
        <form onSubmit={handleSubmit}>
          <div className="directory-modal-body">
            <label className="directory-modal-label" htmlFor="directory-modal-new-name">
              Название
            </label>
            <input
              id="directory-modal-new-name"
              ref={inputRef}
              className="directory-modal-input"
              value={value}
              maxLength={120}
              placeholder="Название директории"
              autoComplete="off"
              disabled={isCreating}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="directory-modal-actions">
            <button type="button" className="directory-modal-cancel" onClick={onClose} disabled={isCreating}>
              Отмена
            </button>
            <button type="submit" className="directory-modal-primary" disabled={!canCreate}>
              {isCreating ? "Создание…" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { RenameDirectoryModal, DeleteDirectoryModal, CreateDirectoryModal };
