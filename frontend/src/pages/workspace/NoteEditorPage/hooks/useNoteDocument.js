import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import * as notesApi from "@/api/notes.js";
import {
  blankNote,
  createBlankListContent,
  createBlankTableContent,
  extractContentText,
  formatDateTime,
  listToMarkdown,
  parseListContent,
  parseTableContent,
  serializeListContent,
  serializeTableContent,
  tableToMarkdown,
} from "../utils";

function normalizeInitialType(type) {
  return type === "List" || type === "Table" ? type : "Empty";
}

function templateTitleFor(type) {
  if (type === "List") return "Список задач";
  if (type === "Table") return "Таблица";
  return blankNote.title;
}

function resolveEditorContent(noteType, rawContent) {
  if (noteType === "List") return serializeListContent(parseListContent(rawContent));
  if (noteType === "Table") return serializeTableContent(parseTableContent(rawContent));
  return extractContentText(rawContent);
}

export function useNoteDocument(
  id,
  isNew,
  loadComments,
  loadAttachments,
  loadPermissions,
  loadDirectories,
  initialType = "",
) {
  const navigate = useNavigate();

  const templateType = normalizeInitialType(initialType);

  const [isLoading, setIsLoading] = useState(!isNew);
  const [error, setError] = useState(null);

  const [version, setVersion] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteNote, setConfirmDeleteNote] = useState(false);

  const [noteType, setNoteType] = useState(isNew ? templateType : null);
  const [title, setTitle] = useState(isNew ? templateTitleFor(templateType) : "");
  const [content, setContent] = useState(() => {
    if (!isNew) return "";
    if (templateType === "List") return createBlankListContent();
    if (templateType === "Table") return createBlankTableContent();
    return blankNote.content;
  });
  const [favorited, setFavorited] = useState(false);
  const [createdAtRaw, setCreatedAtRaw] = useState(null);
  const [updatedAtRaw, setUpdatedAtRaw] = useState(null);
  const [ownerId, setOwnerId] = useState(null);

  const justCreatedIdRef = useRef(null);

  useEffect(() => {
    if (isNew) return;

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

        const loadedNoteType = data.noteType ?? "Empty";
        setNoteType(loadedNoteType);
        setTitle(data.title ?? "");
        setContent(resolveEditorContent(loadedNoteType, data.content));
        setFavorited(Boolean(data.isFavourite));
        setVersion(data.version ?? null);
        setCreatedAtRaw(data.createDate ?? null);
        setUpdatedAtRaw(data.updatedAt ?? null);
        setOwnerId(data.ownerId ?? null);

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
    const exportText =
      noteType === "List"
        ? listToMarkdown(content?.items)
        : noteType === "Table"
          ? tableToMarkdown(content?.rows)
          : content;
    const blob = new Blob([exportText], { type: "text/markdown; charset=utf-8" });
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
    if (isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      if (isNew) {
        const created = await notesApi.create({
          title,
          content,
          noteType,
          isFavourite: favorited,
        });

        const createdNoteType = created.noteType ?? noteType;
        setNoteType(createdNoteType);
        setTitle(created.title ?? title);
        setContent(resolveEditorContent(createdNoteType, created.content));
        setFavorited(Boolean(created.isFavourite));
        setVersion(created.version ?? null);
        setCreatedAtRaw(created.createDate ?? null);
        setUpdatedAtRaw(created.updatedAt ?? null);

        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);

        justCreatedIdRef.current = created.id;
        navigate(`/notes/${created.id}`, { replace: true });
        return;
      }

      const updated = await notesApi.update(id, {
        title,
        content,
        expectedVersion: version,
      });

      const updatedNoteType = updated.noteType ?? noteType;
      setNoteType(updatedNoteType);
      setTitle(updated.title ?? title);
      setContent(resolveEditorContent(updatedNoteType, updated.content));
      setFavorited(Boolean(updated.isFavourite));
      setVersion(updated.version ?? version);
      setUpdatedAtRaw(updated.updatedAt ?? updatedAtRaw);

      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      if (err.status === 409) {
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

  const handleReloadAfterConflict = async () => {
    setIsSaving(true);
    try {
      const data = await notesApi.get(id);
      const reloadedNoteType = data.noteType ?? "Empty";
      setNoteType(reloadedNoteType);
      setTitle(data.title ?? "");
      setContent(resolveEditorContent(reloadedNoteType, data.content));
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

  const handleDelete = () => {
    if (isNew || isDeleting) return;
    setConfirmDeleteNote(true);
  };

  const confirmDelete = async () => {
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
    } finally {
      setConfirmDeleteNote(false);
    }
  };

  const isTogglingFavouriteRef = useRef(false);

  const handleToggleFavorite = async () => {
    if (isNew) {
      setFavorited((prev) => !prev);
      return;
    }
    if (isTogglingFavouriteRef.current) return;
    isTogglingFavouriteRef.current = true;

    setFavorited((prev) => !prev);
    try {
      const updated = await notesApi.toggleFavourite(id);
      setFavorited(Boolean(updated.isFavourite));
      setVersion(updated.version ?? version);
    } catch (err) {
      setFavorited((prev) => !prev);
      setSaveError({
        type: "generic",
        message: err.message || "Не удалось изменить избранное",
      });
    } finally {
      isTogglingFavouriteRef.current = false;
    }
  };

  return {
    title,
    setTitle,
    content,
    setContent,
    noteType,
    favorited,
    toggleFavorite: handleToggleFavorite,
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
    confirmDelete,
    cancelDelete: () => setConfirmDeleteNote(false),
    confirmDeleteNote,
    export: handleExport,
    reloadAfterConflict: handleReloadAfterConflict,
    createdAt: isNew ? blankNote.createdAt : formatDateTime(createdAtRaw),
    updatedAt: isNew ? blankNote.updatedAt : formatDateTime(updatedAtRaw),
  };
}