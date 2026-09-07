import { useCallback, useEffect, useRef, useState } from "react";

import * as directoriesApi from "@/api/directories.js";

export function useNoteDirectories(id, isNew, currentUser) {
  // --- Note ↔ Directory membership (только для owner, так же как permissions) ---
  const [noteDirectories, setNoteDirectories] = useState([]); // [{ id, title }] — без псевдо-пункта "all"
  const [noteDirectoryIds, setNoteDirectoryIds] = useState(new Set()); // directoryId, в которых сейчас лежит заметка
  const [directoriesMenuOpen, setDirectoriesMenuOpen] = useState(false);
  const [directoriesLoading, setDirectoriesLoading] = useState(false);
  const [directoriesError, setDirectoriesError] = useState(null);
  const [updatingDirectoryIds, setUpdatingDirectoryIds] = useState(new Set()); // блокирует только конкретную строку, не весь список
  const directoryMenuWrapRef = useRef(null);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (
        directoryMenuWrapRef.current &&
        !directoryMenuWrapRef.current.contains(e.target)
      ) {
        setDirectoriesMenuOpen(false);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () =>
      document.removeEventListener("click", handleDocumentClick);
  }, []);

  /**
   * Загружает список директорий владельца и определяет, в каких из них сейчас
   * находится эта заметка. Доступно только владельцу (add/remove на backend требуют
   * владение директорией и заметкой), поэтому для не-владельца запрос вообще
   * не делается. ownerIdParam передаётся явно, так же как в loadPermissions.
   *
   * Backend не имеет endpoint вида "в каких директориях лежит эта заметка" —
   * только GET /api/directories/{id}/notes (список всех заметок одной директории).
   * Поэтому membership определяется перебором всех директорий владельца (обычно
   * их немного) и проверкой, есть ли текущий noteId в каждой из них.
   *
   * Список и ошибки сбрасываются до загрузки — при смене заметки в UI не остаётся
   * membership предыдущей заметки (в т.ч. для не-владельца, который грузить не будет).
   */
  const load = useCallback(
    async (ownerIdParam) => {
      if (isNew) return;

      setNoteDirectories([]);
      setNoteDirectoryIds(new Set());
      setDirectoriesError(null);

      if (!currentUser || ownerIdParam !== currentUser.id) return;

      setDirectoriesLoading(true);

      try {
        const page = await directoriesApi.list({ limit: 100 });
        const dirs = (page.items ?? []).map((d) => ({ id: d.id, title: d.title }));
        setNoteDirectories(dirs);

        const memberships = await Promise.all(
          dirs.map(async (dir) => {
            try {
              const notesInDir = await directoriesApi.listNotes(dir.id);
              const isMember = (notesInDir ?? []).some((n) => n.noteId === id);
              return isMember ? dir.id : null;
            } catch {
              // Ошибка по одной директории не должна ломать весь список.
              return null;
            }
          })
        );
        setNoteDirectoryIds(new Set(memberships.filter(Boolean)));
      } catch (err) {
        setDirectoriesError(err.message || "Не удалось загрузить папки");
      } finally {
        setDirectoriesLoading(false);
      }
    },
    [id, isNew, currentUser],
  );

  /**
   * Включает/выключает принадлежность заметки к конкретной директории. Одна заметка может
   * одновременно состоять в нескольких директориях — это обычный toggle без
   * взаимного исключения. Защита от повторной отправки — через updatingDirectoryIds
   * (Set), блокируется только конкретная директория, остальные остаются доступны.
   * При ошибке checked-состояние не меняется. Повторный GET не делается —
   * локально обновляем noteDirectoryIds после успешного add/remove.
   */
  const toggle = useCallback(
    async (directory) => {
      if (isNew || updatingDirectoryIds.has(directory.id)) return;

      const isMember = noteDirectoryIds.has(directory.id);

      setUpdatingDirectoryIds((prev) => new Set(prev).add(directory.id));
      setDirectoriesError(null);

      try {
        if (isMember) {
          await directoriesApi.removeNote(directory.id, id);
          setNoteDirectoryIds((prev) => {
            const next = new Set(prev);
            next.delete(directory.id);
            return next;
          });
        } else {
          await directoriesApi.addNote(directory.id, id);
          setNoteDirectoryIds((prev) => new Set(prev).add(directory.id));
        }
      } catch (err) {
        setDirectoriesError(err.message || "Не удалось обновить принадлежность к папке");
      } finally {
        setUpdatingDirectoryIds((prev) => {
          const next = new Set(prev);
          next.delete(directory.id);
          return next;
        });
      }
    },
    [id, isNew, updatingDirectoryIds, noteDirectoryIds],
  );

  return {
    list: noteDirectories,
    memberIds: noteDirectoryIds,
    load,
    toggle,
    menuOpen: directoriesMenuOpen,
    toggleMenu: () => setDirectoriesMenuOpen((prev) => !prev),
    wrapRef: directoryMenuWrapRef,
    isUpdating: updatingDirectoryIds,
    isLoading: directoriesLoading,
    error: directoriesError,
    dismissError: () => setDirectoriesError(null),
  };
}