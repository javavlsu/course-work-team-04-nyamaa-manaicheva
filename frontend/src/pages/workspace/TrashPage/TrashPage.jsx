import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import * as notesApi from "@/api/notes.js";
import { Trash2 } from "lucide-react";
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
  const { setSidebarProps } = useOutletContext();

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Восстановление/удаление — по одному действию за раз, аналогично renamingFolderId/deletingFolderId
  // в NotesFeedPage/DirectoriesPage.
  const [restoringId, setRestoringId] = useState(null);
  const [purgingId, setPurgingId] = useState(null);
  const [purgingNote, setPurgingNote] = useState(null); // заметка, ожидающая подтверждения в модалке
  const [actionError, setActionError] = useState(null);

  useLayoutEffect(() => {
    setSidebarProps({
      active: "trash",
      onSelectAll: () => navigate("/"),
      onSelectFavorites: () => navigate("/"),
    });
  }, [setSidebarProps]);

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
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">Корзина</span>
            {!isLoading && !error && (
              <span className="topbar-count">
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
              <Trash2 strokeWidth={1.4} aria-hidden="true" />
              <p>Корзина пуста.</p>
            </div>
          )
        )}

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
    </>
  );
}
