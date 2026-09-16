import { useState } from "react";

export default function LinkModal({ open, onClose, onInsert }) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onInsert(url.trim(), label.trim());
    setUrl("");
    setLabel("");
    onClose();
  };

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="editor-modal-overlay" onClick={handleOverlay}>
      <div className="editor-modal">
        <div className="editor-modal-header">
          <h3>Вставить ссылку</h3>
          <button className="editor-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="editor-modal-field">
            <label htmlFor="link-url">URL</label>
            <input
              id="link-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
          </div>
          <div className="editor-modal-field">
            <label htmlFor="link-label">Подпись ссылки</label>
            <input
              id="link-label"
              type="text"
              placeholder="Необязательно"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="editor-modal-actions">
            <button type="button" className="editor-modal-cancel" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="editor-modal-submit" disabled={!url.trim()}>
              Вставить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
