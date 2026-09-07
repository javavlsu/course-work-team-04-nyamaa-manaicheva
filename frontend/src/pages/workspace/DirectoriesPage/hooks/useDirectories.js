import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import * as notesApi from "../../../../api/notes.js";
import * as directoriesApi from "../../../../api/directories.js";

const FOLDER_TINTS = ["tint-orange", "tint-green", "tint-purple", "tint-blue"];

export function useDirectories({ folderId }) {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [noteFolderMap, setNoteFolderMap] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [folderDetail, setFolderDetail] = useState(null);
  const [renamingFolderId, setRenamingFolderId] = useState(null);
  const [deletingFolderId, setDeletingFolderId] = useState(null);
  const [renamingFolder, setRenamingFolder] = useState(null);
  const [deletingFolder, setDeletingFolder] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [folderActionError, setFolderActionError] = useState(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dirsPage, notesPage] = await Promise.all([
        directoriesApi.list({ limit: 50 }),
        notesApi.list({ limit: 50 }),
      ]);
      const mappedFolders = (dirsPage.items ?? []).map((dir, index) => ({
        key: dir.id,
        id: dir.id,
        name: dir.title,
        tint: FOLDER_TINTS[index % FOLDER_TINTS.length],
      }));
      const fetchedNotes = notesPage.items ?? [];
      const map = new Map();
      await Promise.all(
        mappedFolders.map(async (folder) => {
          try {
            const links = await directoriesApi.listNotes(folder.id);
            links.forEach((link) => {
              if (!map.has(link.noteId)) {
                map.set(link.noteId, link.directoryId);
              }
            });
          } catch {
            return;
          }
        })
      );
      setFolders(mappedFolders);
      setNotes(fetchedNotes);
      setNoteFolderMap(map);
      if (folderId) {
        const found = mappedFolders.find((f) => String(f.id) === String(folderId));
        if (found) {
          setFolderDetail(found);
        } else {
          try {
            const dir = await directoriesApi.get(folderId);
            setFolderDetail({ key: dir.id, id: dir.id, name: dir.title, tint: "tint-blue" });
          } catch {
            setFolderDetail(null);
          }
        }
      } else {
        setFolderDetail(null);
      }
    } catch (err) {
      setError(err.message || "Не удалось загрузить данные");
    } finally {
      setIsLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!folderId) {
      setFolderDetail(null);
      return;
    }
    const found = folders.find((f) => String(f.id) === String(folderId));
    if (found) setFolderDetail(found);
  }, [folderId, folders]);

  const notesWithFolderId = notes.map((n) => ({
    ...n,
    folderId: noteFolderMap.get(n.id) || null,
  }));

  const foldersWithCount = folders.map((f) => ({
    ...f,
    notesCount: [...noteFolderMap.values()].filter((v) => String(v) === String(f.id)).length,
  }));

  const toggleFavorite = async (id) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isFavourite: !n.isFavourite } : n)));
    try {
      const updated = await notesApi.toggleFavourite(id);
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
    } catch {
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isFavourite: !n.isFavourite } : n)));
    }
  };

  const handleMoveNote = async (noteId, targetFolderId) => {
    const current = noteFolderMap.get(noteId) || null;
    if (String(current) === String(targetFolderId)) return;
    try {
      if (current) await directoriesApi.removeNote(current, noteId);
      await directoriesApi.addNote(targetFolderId, noteId);
      setNoteFolderMap((prev) => {
        const next = new Map(prev);
        next.set(noteId, targetFolderId);
        return next;
      });
    } catch {
      return;
    }
  };

  const handleRemoveNote = async (noteId) => {
    const current = noteFolderMap.get(noteId);
    if (!current) return;
    try {
      await directoriesApi.removeNote(current, noteId);
      setNoteFolderMap((prev) => {
        const next = new Map(prev);
        next.delete(noteId);
        return next;
      });
    } catch {
      return;
    }
  };

  const handleCreateAndMove = async (noteId, title) => {
    const current = noteFolderMap.get(noteId) || null;
    try {
      const created = await directoriesApi.create({ title });
      const newFolder = { key: created.id, id: created.id, name: created.title, tint: FOLDER_TINTS[folders.length % FOLDER_TINTS.length] };
      setFolders((prev) => [...prev, newFolder]);
      if (current) await directoriesApi.removeNote(current, noteId);
      await directoriesApi.addNote(created.id, noteId);
      setNoteFolderMap((prev) => {
        const next = new Map(prev);
        next.set(noteId, created.id);
        return next;
      });
    } catch {
      return;
    }
  };

  const handleCreateSubmit = async (title) => {
    if (isCreating) return;

    setIsCreating(true);
    setFolderActionError(null);

    try {
      const created = await directoriesApi.create({ title });
      const newFolder = {
        key: created.id,
        id: created.id,
        name: created.title,
        tint: FOLDER_TINTS[folders.length % FOLDER_TINTS.length],
      };
      setFolders((prev) => [...prev, newFolder]);
      setIsCreateOpen(false);
    } catch (err) {
      setIsCreateOpen(false);
      setFolderActionError(err.message || "Не удалось создать директорию");
    } finally {
      setIsCreating(false);
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
    const targetId = folder.id ?? folder.key;

    setRenamingFolderId(targetId);
    setFolderActionError(null);

    try {
      const updated = await directoriesApi.update(targetId, { title: newTitle });
      const nextName = updated.title ?? newTitle;
      setFolders((prev) =>
        prev.map((f) =>
          String(f.id ?? f.key) === String(targetId) ? { ...f, name: nextName } : f
        )
      );
      setFolderDetail((prev) =>
        prev && String(prev.id ?? prev.key) === String(targetId) ? { ...prev, name: nextName } : prev
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
    const targetId = folder.id ?? folder.key;

    setDeletingFolderId(targetId);
    setFolderActionError(null);

    try {
      await directoriesApi.remove(targetId);
      setFolders((prev) => prev.filter((f) => String(f.id ?? f.key) !== String(targetId)));
      setNoteFolderMap((prev) => {
        const next = new Map(prev);
        [...next.entries()].forEach(([noteId, dirId]) => {
          if (String(dirId) === String(targetId)) next.delete(noteId);
        });
        return next;
      });
      if (folderDetail && String(folderDetail.id ?? folderDetail.key) === String(targetId)) {
        setFolderDetail(null);
      }
      setDeletingFolder(null);
      if (String(folderId) === String(targetId)) {
        navigate("/directories");
      }
    } catch (err) {
      setDeletingFolder(null);
      setFolderActionError(err.message || "Не удалось удалить директорию");
    } finally {
      setDeletingFolderId(null);
    }
  };

  const favoritesCount = notesWithFolderId.filter((n) => n.isFavourite).length;
  const unassignedNotes = notesWithFolderId.filter((n) => n.folderId === null || n.folderId === undefined);
  const folderNotes = folderId ? notesWithFolderId.filter((n) => String(n.folderId) === String(folderId)) : [];

  const displayNotes = folderId ? folderNotes : unassignedNotes;
  const pageTitle = folderId ? (folderDetail?.name || "Папка") : "Директории";
  const isDetailBusy =
    (folderDetail && renamingFolderId === (folderDetail.id ?? folderDetail.key)) ||
    (folderDetail && deletingFolderId === (folderDetail.id ?? folderDetail.key));

  return {
    folders,
    foldersWithCount,
    notes,
    notesWithFolderId,
    isLoading,
    error,
    fetchAll,
    folderDetail,
    renamingFolderId,
    deletingFolderId,
    renamingFolder,
    setRenamingFolder,
    deletingFolder,
    setDeletingFolder,
    isCreateOpen,
    setIsCreateOpen,
    isCreating,
    folderActionError,
    setFolderActionError,
    toggleFavorite,
    handleMoveNote,
    handleRemoveNote,
    handleCreateAndMove,
    handleCreateSubmit,
    handleRenameFolder,
    handleRenameSubmit,
    handleDeleteFolder,
    handleDeleteConfirm,
    displayNotes,
    folderNotes,
    favoritesCount,
    pageTitle,
    isDetailBusy,
  };
}
