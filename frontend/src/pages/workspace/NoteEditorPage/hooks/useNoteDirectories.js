import { useCallback, useEffect, useRef, useState } from "react";

import * as directoriesApi from "@/api/directories.js";

export function useNoteDirectories(id, isNew, currentUser) {
  const [noteDirectories, setNoteDirectories] = useState([]);
  const [noteDirectoryIds, setNoteDirectoryIds] = useState(new Set());
  const [directoriesMenuOpen, setDirectoriesMenuOpen] = useState(false);
  const [directoriesLoading, setDirectoriesLoading] = useState(false);
  const [directoriesError, setDirectoriesError] = useState(null);
  const [updatingDirectoryIds, setUpdatingDirectoryIds] = useState(new Set());
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

  const load = useCallback(
    async (ownerIdParam) => {
      if (isNew) return;

      setNoteDirectories([]);
      setNoteDirectoryIds(new Set());
      setDirectoriesError(null);

      if (!currentUser || ownerIdParam !== currentUser.id) return;

      setDirectoriesLoading(true);

      try {
        const allDirs = await directoriesApi.listAll();
        const dirs = allDirs.map((d) => ({ id: d.id, title: d.title }));
        setNoteDirectories(dirs);

        const memberships = await Promise.all(
          dirs.map(async (dir) => {
            try {
              const notesInDir = await directoriesApi.listNotes(dir.id);
              const isMember = (notesInDir ?? []).some((n) => n.noteId === id);
              return isMember ? dir.id : null;
            } catch {
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