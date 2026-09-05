import { useCallback, useEffect, useRef, useState } from "react";

import * as notesApi from "../../api/notes.js";
import * as directoriesApi from "../../api/directories.js";
import AppSidebar from "../../components/layout/AppSidebar";
import { RenameDirectoryModal, DeleteDirectoryModal, CreateDirectoryModal } from "../../components/DirectoryModal";
import Topbar from "./Topbar";
import Toolbar from "./Toolbar";
import FoldersSection from "./FoldersSection";
import NotesGrid from "./NotesGrid";
import EmptyState from "./EmptyState";
import FabGroup from "./FabGroup";
import "./NotesFeedPage.css";

const PAGE_LIMIT = 20;

function pluralRu(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "заметка";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "заметки";
  return "заметок";
}

export function NotesFeedPage() {
  const [collapsed, setCollapsed] = useState(false);

  // --- Notes state (реальный API) ---
  const [notes, setNotes]         = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  // --- Notes infinite scroll state ---
  const [nextCursor, setNextCursor]       = useState(null);
  const [hasMore, setHasMore]             = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(null);

  // Refs дублируют cursor/hasMore/isLoadingMore для синхронного чтения
  // внутри IntersectionObserver callback (без stale closures и без
  // пересоздания observer при каждом изменении state).
  const cursorRef        = useRef(null);
  const hasMoreRef       = useRef(false);
  const isLoadingMoreRef = useRef(false);

  useEffect(() => { cursorRef.current = nextCursor; }, [nextCursor]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { isLoadingMoreRef.current = isLoadingMore; }, [isLoadingMore]);

  // --- Directories (реальный API) ---
  // "all" — синтетический пункт на frontend, backend такого понятия не имеет.
  const ALL_FOLDER = { key: "all", name: "Все заметки", tint: "tint-blue" };
  const FOLDER_TINTS = ["tint-orange", "tint-green", "tint-purple", "tint-blue"];

  const [folders, setFolders]                   = useState([ALL_FOLDER]);
  const [activeFolder, setActiveFolder]         = useState("all");
  const [isFoldersLoading, setIsFoldersLoading] = useState(true);
  const [foldersError, setFoldersError]         = useState(null);

  // --- Directory CRUD state ---
  const [isCreatingFolder, setIsCreatingFolder]   = useState(false);
  const [renamingFolderId, setRenamingFolderId]   = useState(null);
  const [deletingFolderId, setDeletingFolderId]   = useState(null);
  const [renamingFolder, setRenamingFolder]       = useState(null);
  const [deletingFolder, setDeletingFolder]       = useState(null);
  const [isCreateOpen, setIsCreateOpen]           = useState(false);
  const [folderActionError, setFolderActionError] = useState(null);

  // activeFolder читается внутри loadMore/fetchNotesPage через ref,
  // чтобы не пересоздавать loadMore (и, соответственно, IntersectionObserver)
  // при каждой смене выбранной директории.
  const activeFolderRef = useRef("all");
  useEffect(() => { activeFolderRef.current = activeFolder; }, [activeFolder]);

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

  // --- Search: input value + debounced value, отправляемая в backend ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debouncedSearchRef = useRef("");

  useEffect(() => { debouncedSearchRef.current = debouncedSearch; }, [debouncedSearch]);

  // Debounce ~350мс: обновляем debouncedSearch только после паузы в наборе,
  // чтобы не делать запрос на каждое нажатие клавиши.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  // search применяется только для источника "all" (GET /api/notes его поддерживает).
  // Когда выбрана конкретная директория, effectiveSearchKey остаётся пустым —
  // это предотвращает лишние перезагрузки directory-notes при наборе текста в поиске.
  const effectiveSearchKey = activeFolder === "all" ? debouncedSearch : "";

  // --- Фильтр по isFavourite: undefined — все заметки, true — только избранные, false — только неизбранные ---
  const [isFavouriteFilter, setIsFavouriteFilter] = useState(undefined);
  const isFavouriteFilterRef = useRef(undefined);
  useEffect(() => { isFavouriteFilterRef.current = isFavouriteFilter; }, [isFavouriteFilter]);

  // Тот же принцип, что и effectiveSearchKey: isFavourite применяется только для "all",
  // directory-notes endpoint этот параметр не поддерживает.
  const effectiveFavouriteKey = activeFolder === "all" ? isFavouriteFilter : undefined;

  /**
   * Загружает одну страницу заметок для текущего источника (activeFolderRef):
   *
   *  - "all"       → GET /api/notes?limit&cursor (полноценный cursor-based backend)
   *  - directoryId → GET /api/directories/{id}/notes
   *
   * ВАЖНО (backend-ограничение): второй endpoint (DirectoryNoteController)
   * возвращает только пары { noteId, directoryId } — без title/content/noteType —
   * и не поддерживает cursor-пагинацию (обычный массив, не PageResponse).
   * Поэтому для directory-режима мы:
   *   1) получаем список noteId одним запросом,
   *   2) дозагружаем детали каждой заметки через notes.get(id),
   *   3) возвращаем hasMore=false — подгружать больше нечего, весь список уже получен.
   *
   * Функция не завязана на React state напрямую (только через refs), поэтому
   * может безопасно использоваться и в initial-load эффекте, и в loadMore
   * без дублирования логики fetch/append.
   */
  const fetchNotesPage = useCallback(async (cursor) => {
    const source = activeFolderRef.current;

    if (source === "all") {
      const search = debouncedSearchRef.current || undefined;
      const isFavourite = isFavouriteFilterRef.current;
      return notesApi.list({ limit: PAGE_LIMIT, cursor, search, isFavourite });
    }

    // Directory-scoped: cursor игнорируется, т.к. backend его не поддерживает.
    const links = await directoriesApi.listNotes(source);
    const items = await Promise.all(links.map((link) => notesApi.get(link.noteId)));
    return { items, nextCursor: null, hasMore: false };
  }, []);

  // Загрузка первой страницы notes: при монтировании и при каждой смене
  // выбранной директории (activeFolder). Сбрасывает notes/cursor/hasMore.
  useEffect(() => {
    let cancelled = false;

    async function loadFirstPage() {
      setIsLoading(true);
      setError(null);
      // Полный сброс списка и пагинации перед загрузкой нового источника
      setNotes([]);
      setNextCursor(null);
      setHasMore(true);

      try {
        const page = await fetchNotesPage(null);
        if (!cancelled) {
          setNotes(page.items ?? []);
          setNextCursor(page.nextCursor ?? null);
          setHasMore(Boolean(page.hasMore));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Не удалось загрузить заметки");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFirstPage();
    return () => { cancelled = true; };
  }, [activeFolder, effectiveSearchKey, effectiveFavouriteKey, fetchNotesPage]);

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
   * Подгружает следующую страницу заметок текущего источника по cursor,
   * полученному от backend в предыдущем ответе. Для directory-режима
   * hasMoreRef будет false сразу после первой загрузки, поэтому loadMore
   * для него фактически не выполняет новых запросов — это ожидаемо,
   * т.к. GET /api/directories/{id}/notes отдаёт полный список одним куском.
   *
   * Защищено от гонки: если пользователь переключил директорию, пока
   * запрос был в полёте, ответ игнорируется (source проверяется дважды).
   */
  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMoreRef.current) return;

    const sourceAtStart = activeFolderRef.current;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const page = await fetchNotesPage(cursorRef.current);

      // Источник сменился, пока запрос летел — результат больше не актуален,
      // initial-load эффект для нового источника уже всё сбросил сам.
      if (activeFolderRef.current !== sourceAtStart) return;

      // Append — существующие notes не заменяются
      setNotes((prev) => [...prev, ...(page.items ?? [])]);
      setNextCursor(page.nextCursor ?? null);
      setHasMore(Boolean(page.hasMore));
    } catch (err) {
      if (activeFolderRef.current === sourceAtStart) {
        // Уже загруженные notes остаются на экране — список не трогаем
        setLoadMoreError(err.message || "Не удалось загрузить ещё заметки");
      }
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [fetchNotesPage]);

  // Callback ref на sentinel-элемент внизу списка notes.
  // Пересоздаёт IntersectionObserver только когда сам sentinel
  // монтируется/размонтируется (например, когда hasMore становится false).
  const observerInstanceRef = useRef(null);
  const sentinelRef = useCallback(
    (node) => {
      if (observerInstanceRef.current) {
        observerInstanceRef.current.disconnect();
        observerInstanceRef.current = null;
      }
      if (!node) return;

      observerInstanceRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            loadMore();
          }
        },
        { rootMargin: "200px" }
      );
      observerInstanceRef.current.observe(node);
    },
    [loadMore]
  );

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

  // Оптимистичное переключение избранного через API
  const toggleFavorite = async (id) => {
    // Optimistic update — сразу меняем UI
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isFavourite: !n.isFavourite } : n
      )
    );
    try {
      const updated = await notesApi.toggleFavourite(id);
      // Синхронизируем с ответом backend (актуальная version и isFavourite)
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...updated } : n))
      );
    } catch {
      // Откатываем optimistic update при ошибке
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isFavourite: !n.isFavourite } : n
        )
      );
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Фактический fetch/сброс notes произойдёт после debounce (см. эффект выше),
    // когда изменится debouncedSearch/effectiveSearchKey.
  };

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
      if (activeFolder === folder.key) {
        handleSelectAll();
      }
      setDeletingFolder(null);
    } catch (err) {
      setDeletingFolder(null);
      setFolderActionError(err.message || "Не удалось удалить директорию");
    } finally {
      setDeletingFolderId(null);
    }
  };

  // Клик по "Все заметки" в sidebar — полный сброс к дефолтному виду списка.
  const handleSelectAll = () => {
    setIsFavouriteFilter(undefined);
    setActiveFolder("all");
  };

  // Клик по "Избранное" в sidebar — глобальный фильтр, не привязан к конкретной директории,
  // поэтому также сбрасывает выбор папки на "all".
  const handleSelectFavorites = () => {
    setActiveFolder("all");
    setIsFavouriteFilter(true);
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

  const notesEnriched = notes.map((n) => ({
    ...n,
    folderId: noteFolderMap.get(n.id) || null,
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

  const favoritesCount = notes.filter((n) => n.isFavourite).length;
  const directoriesCount = Math.max(0, folders.length - 1);

  return (
    <div className="app">
      <AppSidebar
        active={isFavouriteFilter === true ? "favorites" : "notes"}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        counts={{ all: notes.length, directories: directoriesCount, favorites: favoritesCount }}
        onSelectAll={handleSelectAll}
        onSelectFavorites={handleSelectFavorites}
      />
      <div className="main">
        <Topbar count={notes.length} pluralRu={pluralRu} />
        <Toolbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />

        {/* Notes loading state (первая загрузка / смена директории) */}
        {isLoading && (
          <div className="notes-loading">
            <div className="notes-loading-spinner" />
            <span>Загрузка заметок…</span>
          </div>
        )}

        {/* Notes error state (первая загрузка) */}
        {!isLoading && error && (
          <div className="notes-error">
            <p>{error}</p>
            <button
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Notes list + infinite scroll */}
        {!isLoading && !error && (
          notesEnriched.length > 0 ? (
            <>
              <NotesGrid notes={notesEnriched} folders={foldersForSelector} onToggle={toggleFavorite} onMove={handleMoveNote} onRemove={handleRemoveNote} onCreateAndMove={handleCreateAndMove} />

              {/* Sentinel для IntersectionObserver — рендерится только пока есть ещё страницы */}
              {hasMore && (
                <div ref={sentinelRef} className="notes-load-more-sentinel">
                  {isLoadingMore && (
                    <div className="notes-load-more">
                      <div className="notes-loading-spinner notes-loading-spinner-sm" />
                      <span>Загрузка…</span>
                    </div>
                  )}
                </div>
              )}

              {/* Ошибка подгрузки следующей страницы — уже загруженные notes остаются */}
              {loadMoreError && (
                <div className="notes-load-more-error">
                  <span>{loadMoreError}</span>
                  <button className="btn btn-secondary" onClick={loadMore}>
                    Повторить
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState />
          )
        )}
      </div>
      <FabGroup onNewFolder={addFolder} />
      {renamingFolder && (
        <RenameDirectoryModal
          folderName={renamingFolder.name}
          isSaving={Boolean(renamingFolderId)}
          onClose={() => {
            if (!renamingFolderId) setRenamingFolder(null);
          }}
          onSubmit={handleRenameSubmit}
        />
      )}
      {deletingFolder && (
        <DeleteDirectoryModal
          folderName={deletingFolder.name}
          isDeleting={Boolean(deletingFolderId)}
          onClose={() => {
            if (!deletingFolderId) setDeletingFolder(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {isCreateOpen && (
        <CreateDirectoryModal
          isCreating={isCreatingFolder}
          onClose={() => {
            if (!isCreatingFolder) setIsCreateOpen(false);
          }}
          onSubmit={handleCreateSubmit}
        />
      )}
    </div>
  );
}
