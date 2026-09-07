import { useCallback, useEffect, useRef, useState } from "react";

import * as directoriesApi from "../../../../api/directories.js";

const PAGE_LIMIT = 20;

// "all" — синтетический пункт на frontend, backend такого понятия не имеет.
const ALL_FOLDER = { key: "all", name: "Все заметки", tint: "tint-blue" };
const FOLDER_TINTS = ["tint-orange", "tint-green", "tint-purple", "tint-blue"];

export function useFolders({ activeFolder, onSelectAll }) {
  // --- Directories (реальный API) ---
  const [folders, setFolders]                   = useState([ALL_FOLDER]);
  const [isFoldersLoading, setIsFoldersLoading] = useState(true);
  const [foldersError, setFoldersError]         = useState(null);

  // --- Directories infinite scroll state ---
  const [foldersNextCursor, setFoldersNextCursor]       = useState(null);
  const [foldersHasMore, setFoldersHasMore]             = useState(false);
  const [isFoldersLoadingMore, setIsFoldersLoadingMore] = useState(false);
  const [foldersLoadMoreError, setFoldersLoadMoreError] = useState(null);

  const foldersCursorRef        = useRef(null);
  const foldersHasMoreRef       = useRef(false);
  const isFoldersLoadingMoreRef = useRef(false);

  useEffect(() => { foldersCursorRef.current = foldersNextCursor; }, [foldersNextCursor]);
  useEffect(() => { foldersHasMoreRef.current = foldersHasMore; }, [foldersHasMore]);
  useEffect(() => { isFoldersLoadingMoreRef.current = isFoldersLoadingMore; }, [isFoldersLoadingMore]);

  // --- Directory CRUD state ---
  const [isCreatingFolder, setIsCreatingFolder]   = useState(false);
  const [renamingFolderId, setRenamingFolderId]   = useState(null);
  const [deletingFolderId, setDeletingFolderId]   = useState(null);
  const [renamingFolder, setRenamingFolder]       = useState(null);
  const [deletingFolder, setDeletingFolder]       = useState(null);
  const [isCreateOpen, setIsCreateOpen]           = useState(false);
  const [folderActionError, setFolderActionError] = useState(null);

  // Загрузка первой страницы директорий при монтировании
  useEffect(() => {
    let cancelled = false;

    async function fetchDirectories() {
      setIsFoldersLoading(true);
      setFoldersError(null);
      try {
        const page = await directoriesApi.list({ limit: PAGE_LIMIT });
        if (!cancelled) {
          // Адаптация DirectoryResponse { id, title } → формат FoldersSection { key, name, tint }
          const mapped = (page.items ?? []).map((dir, index) => ({
            key: dir.id,
            name: dir.title,
            tint: FOLDER_TINTS[index % FOLDER_TINTS.length],
          }));
          setFolders([ALL_FOLDER, ...mapped]);
          setFoldersNextCursor(page.nextCursor ?? null);
          setFoldersHasMore(Boolean(page.hasMore));
        }
      } catch (err) {
        if (!cancelled) {
          setFoldersError(err.message || "Не удалось загрузить папки");
        }
      } finally {
        if (!cancelled) {
          setIsFoldersLoading(false);
        }
      }
    }

    fetchDirectories();
    return () => { cancelled = true; };
  }, []);

  /**
   * Подгружает следующую страницу директорий по cursor из предыдущего
   * ответа backend. Тот же паттерн, что и loadMore для Notes.
   */
  const loadMoreFolders = useCallback(async () => {
    if (isFoldersLoadingMoreRef.current || !foldersHasMoreRef.current) return;

    isFoldersLoadingMoreRef.current = true;
    setIsFoldersLoadingMore(true);
    setFoldersLoadMoreError(null);

    try {
      const page = await directoriesApi.list({
        limit: PAGE_LIMIT,
        cursor: foldersCursorRef.current,
      });
      const mapped = (page.items ?? []).map((dir, index) => ({
        key: dir.id,
        name: dir.title,
        tint: FOLDER_TINTS[index % FOLDER_TINTS.length],
      }));
      // Append — существующие folders не заменяются
      setFolders((prev) => [...prev, ...mapped]);
      setFoldersNextCursor(page.nextCursor ?? null);
      setFoldersHasMore(Boolean(page.hasMore));
    } catch (err) {
      // Уже загруженные folders остаются на экране
      setFoldersLoadMoreError(err.message || "Не удалось загрузить ещё папки");
    } finally {
      isFoldersLoadingMoreRef.current = false;
      setIsFoldersLoadingMore(false);
    }
  }, []);

  // Callback ref на sentinel-элемент после списка папок.
  const foldersObserverInstanceRef = useRef(null);
  const foldersSentinelRef = useCallback(
    (node) => {
      if (foldersObserverInstanceRef.current) {
        foldersObserverInstanceRef.current.disconnect();
        foldersObserverInstanceRef.current = null;
      }
      if (!node) return;

      foldersObserverInstanceRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            loadMoreFolders();
          }
        },
        { rootMargin: "200px" }
      );
      foldersObserverInstanceRef.current.observe(node);
    },
    [loadMoreFolders]
  );

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
      // Адаптация DirectoryResponse { id, title } → формат FoldersSection { key, name, tint },
      // тот же принцип, что и при загрузке списка.
      setFolders((prev) => [
        ...prev,
        { key: created.id, name: created.title, tint: FOLDER_TINTS[prev.length % FOLDER_TINTS.length] },
      ]);
      setIsCreateOpen(false);
    } catch (err) {
      setIsCreateOpen(false);
      setFolderActionError(err.message || "Не удалось создать директорию");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  /**
   * Переименовывает директорию через PUT /api/directories/{id}. Защита от параллельных
   * rename/delete-действий через renamingFolderId/deletingFolderId. Права проверяет только
   * backend (владелец, иначе 403).
   */
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

  /**
   * Удаляет директорию через DELETE /api/directories/{id}. Если удаляемая папка была
   * выбрана как activeFolder — возвращаемся к "Все заметки" через уже существующий
   * handleSelectAll. Заметки внутри папки не удаляются (backend удаляет только самую директорию).
   */
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
      const map = new Map();
      await Promise.all(
        realFolders.map(async (folder) => {
          try {
            const links = await directoriesApi.listNotes(folder.key);
            links.forEach((link) => {
              if (!map.has(link.noteId)) map.set(link.noteId, link.directoryId);
            });
          } catch {
            return;
          }
        })
      );
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
      notesCount: [...noteFolderMap.values()].filter((v) => String(v) === String(f.key)).length,
    }));

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
      const newFolder = { key: created.id, name: created.title, tint: FOLDER_TINTS[folders.length % FOLDER_TINTS.length] };
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

  return {
    folders,
    isFoldersLoading,
    foldersError,
    foldersHasMore,
    isFoldersLoadingMore,
    foldersLoadMoreError,
    loadMoreFolders,
    foldersSentinelRef,
    isCreatingFolder,
    renamingFolderId,
    deletingFolderId,
    renamingFolder,
    setRenamingFolder,
    deletingFolder,
    setDeletingFolder,
    isCreateOpen,
    setIsCreateOpen,
    folderActionError,
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
