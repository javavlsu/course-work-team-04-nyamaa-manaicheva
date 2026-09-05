import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import * as notesApi from "../../api/notes.js";
import AppSidebar from "../../components/layout/AppSidebar";
import TrashItem from "./TrashItem";
import PurgeConfirmModal from "./PurgeConfirmModal";
import "./TrashPage.css";

function pluralRuNotes(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "заметка";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "заметки";
  return "заметок";
}

export function TrashPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Восстановление/удаление — по одному действию за раз, аналогично renamingFolderId/deletingFolderId
  // в NotesFeedPage/DirectoriesPage.
  const [restoringId, setRestoringId] = useState(null);
  const [purgingId, setPurgingId] = useState(null);
  const [purgingNote, setPurgingNote] = useState(null); // заметка, ожидающая подтверждения в модалке
  const [actionError, setActionError] = useState(null);

  const fetchTrash = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await notesApi.listTrash();
      setNotes(items ?? []);
    } catch (err) {
      setError(err.message || "Не удалось загрузить корзину");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const handleRestore = async (note) => {
    if (restoringId || purgingId) return;

    setRestoringId(note.id);
    setActionError(null);

    try {
      await notesApi.restore(note.id);
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
    } catch (err) {
      setActionError(err.message || "Не удалось восстановить заметку");
    } finally {
      setRestoringId(null);
    }
  };

  const handlePurgeRequest = (note) => {
    if (restoringId || purgingId) return;
    setActionError(null);
    setPurgingNote(note);
  };

  const handlePurgeConfirm = async () => {
    const note = purgingNote;
    if (!note || restoringId || purgingId) return;

    setPurgingId(note.id);
    setActionError(null);

    try {
      await notesApi.purge(note.id);
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
      setPurgingNote(null);
    } catch (err) {
      setPurgingNote(null);
      setActionError(err.message || "Не удалось удалить заметку навсегда");
    } finally {
      setPurgingId(null);
    }
  };

  return (
    <div className="app">
      <AppSidebar
        active="trash"
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onSelectAll={() => navigate("/")}
        onSelectFavorites={() => navigate("/")}
      />
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Корзина</span>
            {!isLoading && !error && (
              <span style={{ fontSize: "14px", color: "var(--muted)", marginLeft: "8px" }}>
                {notes.length} {pluralRuNotes(notes.length)}
              </span>
            )}
          </div>
          <div className="topbar-right"></div>
        </div>

        {actionError && (
          <div className="trash-action-error" role="alert">
            <span>{actionError}</span>
            <button type="button" onClick={() => setActionError(null)}>
              Скрыть
            </button>
          </div>
        )}

        {isLoading && (
          <div className="notes-loading">
            <div className="notes-loading-spinner" />
            <span>Загрузка корзины…</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="notes-error">
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={fetchTrash}>
              Попробовать снова
            </button>
          </div>
        )}

        {!isLoading && !error && (
          notes.length > 0 ? (
            <div className="trash-list">
              {notes.map((note) => (
                <TrashItem
                  key={note.id}
                  note={note}
                  isRestoring={restoringId === note.id}
                  isPurging={purgingId === note.id}
                  disabled={Boolean(restoringId || purgingId)}
                  onRestore={() => handleRestore(note)}
                  onPurgeRequest={() => handlePurgeRequest(note)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13" />
              </svg>
              <p>Корзина пуста.</p>
            </div>
          )
        )}
      </div>

      {purgingNote && (
        <PurgeConfirmModal
          noteTitle={purgingNote.title}
          isPurging={Boolean(purgingId)}
          onClose={() => {
            if (!purgingId) setPurgingNote(null);
          }}
          onConfirm={handlePurgeConfirm}
        />
      )}
    </div>
  );
}
