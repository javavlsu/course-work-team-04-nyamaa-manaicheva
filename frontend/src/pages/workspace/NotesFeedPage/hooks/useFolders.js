import { useEffect, useRef, useState } from "react";

import * as directoriesApi from "@/api/directories.js";
import {
  adaptDirectories,
  adaptFolder,
  buildNoteFolderMap,
  countNotesInFolder,
  createAndMoveNote,
  moveNote,
  removeNoteFromFolder,
} from "@/hooks/folderOperations.js";

const ALL_FOLDER = { key: "all", name: "Все заметки", tint: "tint-blue" };

export function useFolders({ activeFolder, onSelectAll }) {
  const [folders, setFolders] = useState([ALL_FOLDER]);
  const [foldersLoaded, setFoldersLoaded] = useState(false);

  const [isCreatingFolder, setIsCreatingFolder]   = useState(false);
  const [renamingFolderId, setRenamingFolderId]   = useState(null);
  const [deletingFolderId, setDeletingFolderId]   = useState(null);
  const [renamingFolder, setRenamingFolder]       = useState(null);
  const [deletingFolder, setDeletingFolder]       = useState(null);
  const [isCreateOpen, setIsCreateOpen]           = useState(false);
  const [folderActionError, setFolderActionError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDirectories() {
      try {
        const dirs = await directoriesApi.listAll();
        if (!cancelled) {
          setFolders([ALL_FOLDER, ...adaptDirectories(dirs)]);
          setFoldersLoaded(true);
        }
      } catch {
      }
    }

    fetchDirectories();
    return () => { cancelled = true; };
  }, []);

  const addFolder = () => {
    if (isCreatingFolder) return;
    setFolderActionError(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (title) => {
    if (isCreatingFolder) return;

    setIsCreatingFolder(true);
    setFolderActionError(null);

    try {
      const created = await directoriesApi.create({ title });
      setFolders((prev) => [
        ...prev,
        adaptFolder(created, prev.length),
      ]);
      setIsCreateOpen(false);
    } catch (err) {
      setIsCreateOpen(false);
      setFolderActionError(err.message || "Не удалось создать директорию");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleRenameFolder = (folder) => {
    if (renamingFolderId || deletingFolderId) return;
    setFolderActionError(null);
    setRenamingFolder(folder);
  };

  const handleRenameSubmit = async (newTitle) => {
    const folder = renamingFolder;
    if (!folder || renamingFolderId || deletingFolderId) return;

    setRenamingFolderId(folder.key);
    setFolderActionError(null);

    try {
      const updated = await directoriesApi.update(folder.key, { title: newTitle });
      setFolders((prev) =>
        prev.map((f) =>
          f.key === folder.key ? { ...f, name: updated.title ?? newTitle } : f
        )
      );
      setRenamingFolder(null);
    } catch (err) {
      setRenamingFolder(null);
      setFolderActionError(err.message || "Не удалось изменить директорию");
    } finally {
      setRenamingFolderId(null);
    }
  };

  const handleDeleteFolder = (folder) => {
    if (renamingFolderId || deletingFolderId) return;
    setFolderActionError(null);
    setDeletingFolder(folder);
  };

  const handleDeleteConfirm = async () => {
    const folder = deletingFolder;
    if (!folder || renamingFolderId || deletingFolderId) return;

    setDeletingFolderId(folder.key);
    setFolderActionError(null);

    try {
      await directoriesApi.remove(folder.key);
      setFolders((prev) => prev.filter((f) => f.key !== folder.key));
      if (activeFolder === folder.key && onSelectAll) {
        onSelectAll();
      }
      setDeletingFolder(null);
    } catch (err) {
      setDeletingFolder(null);
      setFolderActionError(err.message || "Не удалось удалить директорию");
    } finally {
      setDeletingFolderId(null);
    }
  };

  const [noteFolderMap, setNoteFolderMap] = useState(new Map());

  useEffect(() => {
    const realFolders = folders.filter((f) => f.key !== "all");
    if (realFolders.length === 0) {
      setNoteFolderMap(new Map());
      return;
    }
    let cancelled = false;
    async function fetchMap() {
      const map = await buildNoteFolderMap(realFolders);
      if (!cancelled) setNoteFolderMap(new Map(map));
    }
    fetchMap();
    return () => { cancelled = true; };
  }, [folders]);

  const foldersForSelector = folders
    .filter((f) => f.key !== "all")
    .map((f) => ({
      id: f.key,
      name: f.name,
      tint: f.tint,
      notesCount: countNotesInFolder(noteFolderMap, f.key),
    }));

  const handleMoveNote = async (noteId, targetFolderId) => {
    const next = await moveNote({ noteFolderMap, noteId, targetFolderId });
    if (next) setNoteFolderMap(next);
  };

  const handleRemoveNote = async (noteId) => {
    const next = await removeNoteFromFolder({ noteFolderMap, noteId });
    if (next) setNoteFolderMap(next);
  };

  const handleCreateAndMove = async (noteId, title) => {
    const result = await createAndMoveNote({
      noteFolderMap,
      noteId,
      title,
      folderCount: folders.length,
    });
    if (!result) return;
    const { folder, noteFolderMap: next } = result;
    setFolders((prev) => [...prev, folder]);
    setNoteFolderMap(next);
  };

  return {
    folders,
    foldersLoaded,
    isCreatingFolder,
    renamingFolderId,
    deletingFolderId,
    renamingFolder,
    setRenamingFolder,
    deletingFolder,
    setDeletingFolder,
    isCreateOpen,
    setIsCreateOpen,
    setFolderActionError,
    addFolder,
    handleCreateSubmit,
    handleRenameFolder,
    handleRenameSubmit,
    handleDeleteFolder,
    handleDeleteConfirm,
    noteFolderMap,
    foldersForSelector,
    handleMoveNote,
    handleRemoveNote,
    handleCreateAndMove,
  };
}
