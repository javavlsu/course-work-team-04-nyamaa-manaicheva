import { useState } from "react";

export default function TableModal({ open, onClose, onInsert }) {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(3);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onInsert(rows, cols);
    onClose();
  };

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="editor-modal-overlay" onClick={handleOverlay}>
      <div className="editor-modal">
        <div className="editor-modal-header">
          <h3>Вставить таблицу</h3>
          <button className="editor-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="editor-modal-field">
            <label htmlFor="table-rows">Количество строк</label>
            <input
              id="table-rows"
              type="number"
              min="2"
              max="50"
              value={rows}
              onChange={(e) => setRows(Math.max(2, parseInt(e.target.value, 10) || 2))}
            />
          </div>
          <div className="editor-modal-field">
            <label htmlFor="table-cols">Количество столбцов</label>
            <input
              id="table-cols"
              type="number"
              min="1"
              max="20"
              value={cols}
              onChange={(e) => setCols(Math.max(1, parseInt(e.target.value, 10) || 1))}
            />
          </div>
          <div className="editor-modal-actions">
            <button type="button" className="editor-modal-cancel" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="editor-modal-submit">
              Вставить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
