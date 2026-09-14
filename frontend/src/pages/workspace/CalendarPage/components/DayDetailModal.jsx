import { useState } from "react";
import { X } from "lucide-react";

import * as notesApi from "@/api/notes.js";

const DAY_TITLE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

function DayDetailModal({ date, dateStr, events, onClose, onAddEvent }) {
  const [mode, setMode] = useState(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState(null);
  const [notesError, setNotesError] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);

  const openAttach = async () => {
    setMode("attach");
    setActionError(null);
    if (notes !== null) return;
    try {
      const data = await notesApi.list({ limit: 50 });
      setNotes(data.items);
    } catch (err) {
      setNotesError(err.message || "Не удалось загрузить заметки");
    }
  };

  const handleAdd = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await onAddEvent({
        title: title.trim(),
        startAt: `${dateStr}T00:00:00`,
        endAt: `${dateStr}T00:00:00`,
        allDay: true,
      });
      onClose();
    } catch (err) {
      setActionError(err.message || "Не удалось создать событие");
    } finally {
      setSaving(false);
    }
  };

  const handleAttach = async () => {
    if (!selectedNoteId || saving) return;
    const note = notes?.find((n) => n.id === selectedNoteId);
    setSaving(true);
    setActionError(null);
    try {
      await onAddEvent({
        title: note?.title || "Заметка",
        startAt: `${dateStr}T00:00:00`,
        endAt: `${dateStr}T00:00:00`,
        allDay: true,
        noteId: selectedNoteId,
      });
      onClose();
    } catch (err) {
      setActionError(err.message || "Не удалось прикрепить заметку");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="day-detail-overlay open" onClick={onClose}></div>
      <div className="day-detail open">
        <div className="day-detail-header">
          <span className="day-detail-title">{DAY_TITLE_FORMATTER.format(date)}</span>
          <button className="day-detail-close" onClick={onClose}>
            <X strokeWidth={1.6} />
          </button>
        </div>
        <div className="day-detail-events">
          {events.length === 0 ? (
            <p className="day-detail-empty">Нет событий на этот день</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="day-detail-event">
                <span className="event-dot" style={{ background: "var(--accent)" }}></span>
                <div className="event-info">
                  <div className="event-title">{event.title}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="day-detail-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setMode(mode === "add" ? null : "add");
              setActionError(null);
            }}
          >
            Добавить событие
          </button>
          <button className="btn btn-secondary" onClick={openAttach}>
            Прикрепить заметку
          </button>
        </div>
        {mode === "add" && (
          <form
            className="day-detail-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
          >
            <input
              className="day-detail-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название события"
              autoFocus
            />
            {actionError && <p className="day-detail-form-error">{actionError}</p>}
            <div className="day-detail-form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving || !title.trim()}>
                {saving ? "Создание…" : "Создать"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setMode(null)}>
                Отмена
              </button>
            </div>
          </form>
        )}
        {mode === "attach" && (
          <div className="day-detail-form">
            {notesError ? (
              <p className="day-detail-form-error">{notesError}</p>
            ) : notes === null ? (
              <p className="day-detail-form-error">Загрузка заметок…</p>
            ) : notes.length === 0 ? (
              <p className="day-detail-form-error">Нет доступных заметок</p>
            ) : (
              <>
                <select
                  className="day-detail-select"
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                >
                  <option value="">Выберите заметку</option>
                  {notes.map((note) => (
                    <option key={note.id} value={note.id}>
                      {note.title || "Без названия"}
                    </option>
                  ))}
                </select>
                {actionError && <p className="day-detail-form-error">{actionError}</p>}
                <div className="day-detail-form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAttach}
                    disabled={saving || !selectedNoteId}
                  >
                    {saving ? "Сохранение…" : "Прикрепить"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setMode(null)}>
                    Отмена
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default DayDetailModal;