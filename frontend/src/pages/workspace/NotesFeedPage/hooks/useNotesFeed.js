import { useCallback, useEffect, useRef, useState } from "react";

import * as notesApi from "@/api/notes.js";
import * as directoriesApi from "@/api/directories.js";

const PAGE_LIMIT = 20;

export function useNotesFeed({ favouritesOnly = false } = {}) {
  const [activeFolder, setActiveFolder] = useState(favouritesOnly ? null : "all");

  const [notes, setNotes]         = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const [nextCursor, setNextCursor]       = useState(null);
  const [hasMore, setHasMore]             = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(null);

  const cursorRef        = useRef(null);
  const hasMoreRef       = useRef(false);
  const isLoadingMoreRef = useRef(false);

  useEffect(() => { cursorRef.current = nextCursor; }, [nextCursor]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { isLoadingMoreRef.current = isLoadingMore; }, [isLoadingMore]);

  const activeFolderRef = useRef(favouritesOnly ? null : "all");
  useEffect(() => { activeFolderRef.current = activeFolder; }, [activeFolder]);

  const favouritesOnlyRef = useRef(favouritesOnly);
  useEffect(() => { favouritesOnlyRef.current = favouritesOnly; }, [favouritesOnly]);

  const [sort, setSort] = useState({ sortBy: "createDate", order: "desc" });
  const sortRef = useRef({ sortBy: "createDate", order: "desc" });
  useEffect(() => { sortRef.current = sort; }, [sort]);

  const [totalNotesCount, setTotalNotesCount] = useState(null);
  const [filteredCount, setFilteredCount] = useState(null);
  const [favouritesCount, setFavouritesCount] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debouncedSearchRef = useRef("");

  useEffect(() => { debouncedSearchRef.current = debouncedSearch; }, [debouncedSearch]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const effectiveSearchKey = favouritesOnly ? "" : (activeFolder === "all" ? debouncedSearch : "");

  const [isFavouriteFilter, setIsFavouriteFilter] = useState(undefined);
  const isFavouriteFilterRef = useRef(undefined);
  useEffect(() => { isFavouriteFilterRef.current = isFavouriteFilter; }, [isFavouriteFilter]);

  const effectiveFavouriteKey = favouritesOnly ? undefined : (activeFolder === "all" ? isFavouriteFilter : undefined);

  const effectiveSortKey = favouritesOnly ? "" : (activeFolder === "all" ? `${sort.sortBy}:${sort.order}` : "");

  const fetchNotesPage = useCallback(async (cursor) => {
    if (favouritesOnlyRef.current) {
      return notesApi.list({ limit: PAGE_LIMIT, cursor, isFavourite: true });
    }

    const source = activeFolderRef.current;

    if (source === "all") {
      const search = debouncedSearchRef.current || undefined;
      const isFavourite = isFavouriteFilterRef.current;
      return notesApi.list({
        limit: PAGE_LIMIT,
        cursor,
        search,
        isFavourite,
        sortBy: sortRef.current.sortBy,
        order: sortRef.current.order,
      });
    }

    const links = await directoriesApi.listNotes(source);
    const items = await Promise.all(links.map((link) => notesApi.get(link.noteId)));
    return { items, nextCursor: null, hasMore: false };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFirstPage() {
      setIsLoading(true);
      setError(null);
      setNotes([]);
      setNextCursor(null);
      setHasMore(true);

      try {
        const page = await fetchNotesPage(null);
        if (!cancelled) {
          setNotes(page.items ?? []);
          setNextCursor(page.nextCursor ?? null);
          setHasMore(Boolean(page.hasMore));
          if (activeFolder === "all" || favouritesOnly) {
            setTotalNotesCount(page.totalNotesCount ?? null);
            setFilteredCount(page.filteredCount ?? null);
            setFavouritesCount(page.favouritesCount ?? null);
          }
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
  }, [activeFolder, favouritesOnly, effectiveSearchKey, effectiveFavouriteKey, effectiveSortKey, fetchNotesPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMoreRef.current) return;

    const sourceAtStart = activeFolderRef.current;
    const sortAtStart = sortRef.current;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const page = await fetchNotesPage(cursorRef.current);

      if (activeFolderRef.current !== sourceAtStart || sortRef.current !== sortAtStart) return;

      setNotes((prev) => [...prev, ...(page.items ?? [])]);
      setNextCursor(page.nextCursor ?? null);
      setHasMore(Boolean(page.hasMore));
      if (sourceAtStart === "all" || favouritesOnlyRef.current) {
        setTotalNotesCount(page.totalNotesCount ?? null);
        setFilteredCount(page.filteredCount ?? null);
        setFavouritesCount(page.favouritesCount ?? null);
      }
    } catch (err) {
      if (activeFolderRef.current === sourceAtStart && sortRef.current === sortAtStart) {
        setLoadMoreError(err.message || "Не удалось загрузить ещё заметки");
      }
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [fetchNotesPage]);

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

  const toggleFavorite = async (id) => {
    const note = notes.find((n) => n.id === id);
    const wasFavourite = Boolean(note?.isFavourite);

    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isFavourite: !n.isFavourite } : n
      )
    );
    try {
      const updated = await notesApi.toggleFavourite(id);
      const nowFavourite = Boolean(updated.isFavourite);
      if (favouritesOnlyRef.current && !nowFavourite) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        setFilteredCount((prev) => (prev == null ? prev : Math.max(0, prev - 1)));
        setFavouritesCount((prev) => (prev == null ? prev : Math.max(0, prev - 1)));
        return;
      }
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...updated } : n))
      );
      if (wasFavourite !== nowFavourite) {
        setFavouritesCount((prev) => (prev == null ? prev : Math.max(0, prev + (nowFavourite ? 1 : -1))));
      }
    } catch {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isFavourite: !n.isFavourite } : n
        )
      );
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectAll = () => {
    setIsFavouriteFilter(undefined);
    setActiveFolder("all");
  };

  const handleSelectFavorites = () => {
    setActiveFolder("all");
    setIsFavouriteFilter(true);
  };

  const deleteNote = async (id) => {
    try {
      await notesApi.remove(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setTotalNotesCount((prev) => (prev == null ? prev : Math.max(0, prev - 1)));
      setFilteredCount((prev) => (prev == null ? prev : Math.max(0, prev - 1)));
      const note = notes.find((n) => n.id === id);
      if (note?.isFavourite) {
        setFavouritesCount((prev) => (prev == null ? prev : Math.max(0, prev - 1)));
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
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
    sort,
    setSort,
    totalNotesCount,
    filteredCount,
    favouritesCount,
    isFavouriteFilter,
    toggleFavorite,
    handleSelectAll,
    handleSelectFavorites,
    deleteNote,
  };
}
