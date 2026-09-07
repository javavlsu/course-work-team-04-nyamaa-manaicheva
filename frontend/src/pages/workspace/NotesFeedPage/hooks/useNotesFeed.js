import { useCallback, useEffect, useRef, useState } from "react";

import * as notesApi from "../../../../api/notes.js";
import * as directoriesApi from "../../../../api/directories.js";

const PAGE_LIMIT = 20;

export function useNotesFeed() {
  const [activeFolder, setActiveFolder] = useState("all");

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

  // activeFolder читается внутри loadMore/fetchNotesPage через ref,
  // чтобы не пересоздавать loadMore (и, соответственно, IntersectionObserver)
  // при каждой смене выбранной директории.
  const activeFolderRef = useRef("all");
  useEffect(() => { activeFolderRef.current = activeFolder; }, [activeFolder]);

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

  return {
    activeFolder,
    setActiveFolder,
    notes,
    isLoading,
    error,
    hasMore,
    isLoadingMore,
    loadMoreError,
    loadMore,
    sentinelRef,
    searchQuery,
    handleSearchChange,
    isFavouriteFilter,
    toggleFavorite,
    handleSelectAll,
    handleSelectFavorites,
  };
}
