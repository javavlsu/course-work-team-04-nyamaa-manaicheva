import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Pencil, Trash2, Unlink, X } from "lucide-react";

import * as notesApi from "@/api/notes.js";

const DAY_TITLE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

const DEFAULT_TIME = "12:00";

function pad(value) {
  return String(value).padStart(2, "0");
}

function buildDateTimes(dateStr, time) {
  const start = new Date(`${dateStr}T${time}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const format = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}:00`;
  return { startAt: format(start), endAt: format(end) };
}

function DayDetailModal({
  date,
  dateStr,
  events,
  onClose,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onUnlinkNote,
}) {
  const navigate = useNavigate();

  const [mode, setMode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", time: DEFAULT_TIME, allDay: true });
  const [notes, setNotes] = useState(null);
  const [notesError, setNotesError] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);

  const editingEvent = editingId ? (events.find((event) => event.id === editingId) ?? null) : null;

  const openAdd = () => {
    setMode("add");
    setEditingId(null);
    setForm({ title: "", time: DEFAULT_TIME, allDay: true });
    setActionError(null);
  };

  const openEdit = (event) => {
    setMode("add");
    setEditingId(event.id);
    setForm({
      title: event.title,
      time: event.allDay ? DEFAULT_TIME : event.start.slice(11, 16),
      allDay: event.allDay,
    });
    setActionError(null);
  };

  const closeForm = () => {
    setMode(null);
    setEditingId(null);
  };

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

  const handleFormSubmit = async () => {
    if (!form.title.trim() || saving) return;
    const eventDate = editingEvent ? editingEvent.start.slice(0, 10) : dateStr;
    const payload = form.allDay
      ? {
          title: form.title.trim(),
          startAt: `${eventDate}T00:00:00`,
          endAt: `${eventDate}T00:00:00`,
          allDay: true,
        }
      : {
          title: form.title.trim(),
          ...buildDateTimes(eventDate, form.time),
          allDay: false,
        };
    setSaving(true);
    setActionError(null);
    try {
      if (editingEvent) {
        await onUpdateEvent(editingEvent.id, payload);
      } else {
        await onAddEvent(payload);
      }
      onClose();
    } catch (err) {
      setActionError(err.message || (editingEvent ? "Не удалось сохранить событие" : "Не удалось создать событие"));
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

  const handleDelete = async (event) => {
    if (saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await onDeleteEvent(event.id);
      onClose();
    } catch (err) {
      setActionError(err.message || "Не удалось удалить событие");
      setSaving(false);
    }
  };

  const handleUnlink = async (event) => {
    if (saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await onUnlinkNote(event.id);
      await onDeleteEvent(event.id);
    } catch (err) {
      setActionError(err.message || "Не удалось открепить заметку");
    } finally {
      setSaving(false);
    }
  };

  const openNote = (event) => {
    if (event.noteId) navigate(`/notes/${event.noteId}`);
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
                <span
                  className="event-dot"
                  style={{ background: event.noteId ? "var(--calendar-note)" : "var(--accent)" }}
                ></span>
                <div className="event-info">
                  <div className="event-title">{event.title}</div>
                  {!event.allDay && <div className="event-time">{event.start.slice(11, 16)}</div>}
                </div>
                {event.noteId ? (
                  <div className="day-detail-event-actions">
                    <button
                      type="button"
                      className="day-detail-icon-btn"
                      title="Открыть в редакторе"
                      onClick={() => openNote(event)}
                    >
                      <ExternalLink size={15} strokeWidth={1.8} />
                    </button>
                    <button
                      type="button"
                      className="day-detail-icon-btn"
                      title="Открепить"
                      onClick={() => handleUnlink(event)}
                      disabled={saving}
                    >
                      <Unlink size={15} strokeWidth={1.8} />
                    </button>
                  </div>
                ) : (
                  <div className="day-detail-event-actions">
                    <button
                      type="button"
                      className="day-detail-icon-btn"
                      title="Редактировать"
                      onClick={() => openEdit(event)}
                    >
                      <Pencil size={15} strokeWidth={1.8} />
                    </button>
                    <button
                      type="button"
                      className="day-detail-icon-btn day-detail-delete-btn"
                      title="Удалить"
                      onClick={() => handleDelete(event)}
                      disabled={saving}
                    >
                      <Trash2 size={15} strokeWidth={1.8} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div className="day-detail-actions">
          <button className="btn btn-secondary" onClick={openAdd}>
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
              handleFormSubmit();
            }}
          >
            <input
              className="day-detail-input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Название события"
              autoFocus
            />
            <div className="day-detail-form-row">
              <label className="day-detail-check">
                <input
                  type="checkbox"
                  checked={form.allDay}
                  onChange={(e) => setForm((f) => ({ ...f, allDay: e.target.checked }))}
                />
                Весь день
              </label>
              {!form.allDay && (
                <input
                  type="time"
                  className="day-detail-input day-detail-time-input"
                  value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  required
                />
              )}
            </div>
            {actionError && <p className="day-detail-form-error">{actionError}</p>}
            <div className="day-detail-form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving || !form.title.trim()}>
                {saving ? "Сохранение…" : editingId ? "Сохранить" : "Создать"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={closeForm}>
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
                  <button type="button" className="btn btn-secondary" onClick={closeForm}>
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