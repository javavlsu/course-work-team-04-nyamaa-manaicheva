import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import * as notesApi from "../../../../api/notes.js";
import { blankNote, extractContentText, formatDateTime } from "../utils";

export function useNoteDocument(
  id,
  isNew,
  loadComments,
  loadAttachments,
  loadPermissions,
  loadDirectories,
) {
  const navigate = useNavigate();

  // --- Загрузка существующей заметки: GET /api/notes/:id ---
  const [isLoading, setIsLoading] = useState(!isNew);
  const [error, setError] = useState(null); // { type: "not-found" | "generic", message }

  // version сохраняется для optimistic locking (PUT с expectedVersion).
  const [version, setVersion] = useState(null);

  // --- Save state (PUT/POST /api/notes) ---
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState(null); // { type: "conflict" | "generic", message }

  // --- Delete state (DELETE /api/notes/:id) ---
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState(isNew ? blankNote.title : "");
  const [content, setContent] = useState(isNew ? blankNote.content : "");
  const [favorited, setFavorited] = useState(false);
  const [createdAtRaw, setCreatedAtRaw] = useState(null);
  const [updatedAtRaw, setUpdatedAtRaw] = useState(null);
  const [ownerId, setOwnerId] = useState(null);

  // Хранит id только что созданной через POST заметки, чтобы эффект загрузки
  // ниже не делал GET сразу после navigate("/notes/:newId") — данные уже есть из ответа create().
  const justCreatedIdRef = useRef(null);

  // Загрузка заметки при монтировании / смене id.
  // "new" — заметки ещё не существует на backend, используем blankNote локально.
  useEffect(() => {
    if (isNew) return;

    // Данные уже загружены из ответа POST /api/notes в handleSave — повторный GET не нужен.
    if (justCreatedIdRef.current === id) {
      justCreatedIdRef.current = null;
      return;
    }

    let cancelled = false;

    async function fetchNote() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await notesApi.get(id);
        if (cancelled) return;

        // Адаптация NoteResponse → поля редактора
        setTitle(data.title ?? "");
        setContent(extractContentText(data.content));
        setFavorited(Boolean(data.isFavourite));
        setVersion(data.version ?? null);
        setCreatedAtRaw(data.createDate ?? null);
        setUpdatedAtRaw(data.updatedAt ?? null);
        setOwnerId(data.ownerId ?? null);

        // Комментарии, attachments, permissions и директории грузим только после успешной
        // загрузки заметки, у них своё независимое loading/error состояние, не блокируют рендер.
        // ownerId передаётся из data.ownerId напрямую — setOwnerId выше ещё не применился к state.
        if (!cancelled) {
          loadComments();
          loadAttachments();
          loadPermissions(data.ownerId ?? null);
          loadDirectories(data.ownerId ?? null);
        }
      } catch (err) {
        if (cancelled) return;
        if (err.status === 404) {
          setError({ type: "not-found", message: "Заметка не найдена" });
        } else {
          setError({
            type: "generic",
            message: err.message || "Не удалось загрузить заметку",
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchNote();
    return () => { cancelled = true; };
  }, [id, isNew, loadComments, loadAttachments, loadPermissions, loadDirectories]);

  const handleExport = () => {
    const safeTitle = title || "Без названия";
    const blob = new Blob([content], { type: "text/markdown; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      safeTitle
        .replace(/[^a-zA-Zа-яА-Я0-9_\- ]/g, "")
        .trim()
        .replace(/\s+/g, "-") + ".md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    // Защита от повторной отправки пока запрос уже в полёте (общая для create и update).
    if (isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      if (isNew) {
        // Backend contract POST /api/notes: { title, content, noteType, isFavourite }
        // noteType в редакторе пока не выбирается UI — используем "Empty" по умолчанию.
        const created = await notesApi.create({
          title,
          content,
          noteType: "Empty",
          isFavourite: favorited,
        });

        // Обновляем данные из ответа backend — так же, как и после GET/PUT
        setTitle(created.title ?? title);
        setContent(extractContentText(created.content));
        setFavorited(Boolean(created.isFavourite));
        setVersion(created.version ?? null);
        setCreatedAtRaw(created.createDate ?? null);
        setUpdatedAtRaw(created.updatedAt ?? null);

        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);

        // Помечаем id, чтобы эффект загрузки не делал лишний GET после перехода
        justCreatedIdRef.current = created.id;
        navigate(`/notes/${created.id}`, { replace: true });
        return;
      }

      // expectedVersion берётся только из state, полученного при последнем GET/PUT —
      // никогда не генерируется на frontend.
      const updated = await notesApi.update(id, {
        title,
        content,
        expectedVersion: version,
      });

      // Обновляем данные из ответа backend — в том числе новый version
      setTitle(updated.title ?? title);
      setContent(extractContentText(updated.content));
      setFavorited(Boolean(updated.isFavourite));
      setVersion(updated.version ?? version);
      setUpdatedAtRaw(updated.updatedAt ?? updatedAtRaw);

      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      if (err.status === 409) {
        // Optimistic locking conflict — не перезаписываем локальные title/content.
        setSaveError({
          type: "conflict",
          message:
            "Заметка была изменена в другом месте. Загрузите актуальную версию, чтобы продолжить.",
        });
      } else {
        setSaveError({
          type: "generic",
          message:
            err.message ||
            (isNew ? "Не удалось создать заметку" : "Не удалось сохранить заметку"),
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * После 409 Conflict пользователь может перезагрузить актуальную версию заметки
   * с backend (GET /api/notes/:id). Локальные title/content/version при этом перезаписываются
   * намеренно — это явное действие пользователя, а не автоматический откат.
   */
  const handleReloadAfterConflict = async () => {
    setIsSaving(true);
    try {
      const data = await notesApi.get(id);
      setTitle(data.title ?? "");
      setContent(extractContentText(data.content));
      setFavorited(Boolean(data.isFavourite));
      setVersion(data.version ?? null);
      setCreatedAtRaw(data.createDate ?? null);
      setUpdatedAtRaw(data.updatedAt ?? null);
      setSaveError(null);
    } catch (err) {
      setSaveError({
        type: "generic",
        message: err.message || "Не удалось загрузить актуальную версию",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Удаление заметки. Недоступно для "new" (кнопка в EditorTopbar дизейблена через deleteDisabled).
   * Перед запросом — window.confirm. Защита от повторной отправки через isDeleting.
   * Ошибка показывается через тот же баннер saveError, что и для save.
   */
  const handleDelete = async () => {
    if (isNew || isDeleting) return;

    const confirmed = window.confirm("Удалить эту заметку? Это действие нельзя отменить.");
    if (!confirmed) return;

    setIsDeleting(true);
    setSaveError(null);

    try {
      await notesApi.remove(id);
      navigate("/notes", { replace: true });
    } catch (err) {
      setSaveError({
        type: "generic",
        message: err.message || "Не удалось удалить заметку",
      });
      setIsDeleting(false);
    }
  };

  return {
    title,
    setTitle,
    content,
    setContent,
    favorited,
    toggleFavorite: () => setFavorited((prev) => !prev),
    version,
    ownerId,
    isLoading,
    error,
    isSaving,
    justSaved,
    saveError,
    dismissSaveError: () => setSaveError(null),
    isDeleting,
    save: handleSave,
    delete: handleDelete,
    export: handleExport,
    reloadAfterConflict: handleReloadAfterConflict,
    createdAt: isNew ? blankNote.createdAt : formatDateTime(createdAtRaw),
    updatedAt: isNew ? blankNote.updatedAt : formatDateTime(updatedAtRaw),
  };
}