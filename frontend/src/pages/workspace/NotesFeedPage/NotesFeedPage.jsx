import { useEffect, useLayoutEffect } from "react";
import { useOutletContext } from "react-router-dom";

import { RenameDirectoryModal, DeleteDirectoryModal, CreateDirectoryModal } from "@/components/modals/DirectoryModal";
import NotesGrid from "@/components/notes/NotesGrid";
import EmptyState from "@/components/notes/EmptyState";
import FabGroup from "@/components/notes/FabGroup";
import { updateNotesCounts } from "@/hooks/useNotesCounts.js";
import { useNotesFeed } from "./hooks/useNotesFeed";
import { useFolders } from "./hooks/useFolders";
import Topbar from "./Topbar";
import Toolbar from "./Toolbar";
import "./NotesFeedPage.css";

function pluralRu(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "заметка";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "заметки";
  return "заметок";
}

export function NotesFeedPage({ favouritesOnly = false } = {}) {
  const { setSidebarProps } = useOutletContext();

  const feed = useNotesFeed({ favouritesOnly });
  const dirs = useFolders({ activeFolder: feed.activeFolder, onSelectAll: feed.handleSelectAll });

  const notesEnriched = feed.notes.map((n) => ({
    ...n,
    folderId: dirs.noteFolderMap.get(n.id) || null,
  }));

  useEffect(() => {
    updateNotesCounts({
      totalNotesCount: feed.totalNotesCount,
      favouritesCount: feed.favouritesCount,
      directoriesCount: dirs.foldersLoaded ? Math.max(0, dirs.folders.length - 1) : undefined,
    });
  }, [feed.totalNotesCount, feed.favouritesCount, dirs.folders, dirs.foldersLoaded]);

  useLayoutEffect(() => {
    setSidebarProps({
      active: favouritesOnly ? "favorites" : "notes",
      onSelectAll: feed.handleSelectAll,
    });
  }, [setSidebarProps, favouritesOnly]);

  const topCount = (favouritesOnly || feed.activeFolder === "all")
    ? (feed.filteredCount == null ? (feed.isLoading ? null : feed.notes.length) : feed.filteredCount)
    : feed.notes.length;

  return (
    <>
      <Topbar
        title={favouritesOnly ? "Избранное" : "Все заметки"}
        count={topCount}
        pluralRu={pluralRu}
      />
        {!favouritesOnly && (
          <Toolbar
            searchQuery={feed.searchQuery}
            onSearchChange={feed.handleSearchChange}
            sort={feed.sort}
            onSortChange={feed.setSort}
            sortDisabled={feed.activeFolder !== "all"}
          />
        )}

        {/* Notes loading state (первая загрузка / смена директории) */}
        {feed.isLoading && (
          <div className="notes-loading">
            <div className="notes-loading-spinner" />
            <span>Загрузка заметок…</span>
          </div>
        )}

        {/* Notes error state (первая загрузка) */}
        {!feed.isLoading && feed.error && (
          <div className="notes-error">
            <p>{feed.error}</p>
            <button
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Notes list + infinite scroll */}
        {!feed.isLoading && !feed.error && (
          notesEnriched.length > 0 ? (
            <>
              <NotesGrid notes={notesEnriched} folders={dirs.foldersForSelector} onToggle={feed.toggleFavorite} onMove={dirs.handleMoveNote} onRemove={dirs.handleRemoveNote} onCreateAndMove={dirs.handleCreateAndMove} />

              {/* Sentinel для IntersectionObserver — рендерится только пока есть ещё страницы */}
              {feed.hasMore && (
                <div ref={feed.sentinelRef} className="notes-load-more-sentinel">
                  {feed.isLoadingMore && (
                    <div className="notes-load-more">
                      <div className="notes-loading-spinner notes-loading-spinner-sm" />
                      <span>Загрузка…</span>
                    </div>
                  )}
                </div>
              )}

              {/* Ошибка подгрузки следующей страницы — уже загруженные notes остаются */}
              {feed.loadMoreError && (
                <div className="notes-load-more-error">
                  <span>{feed.loadMoreError}</span>
                  <button className="btn btn-secondary" onClick={feed.loadMore}>
                    Повторить
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState />
          )
        )}
      <FabGroup onNewFolder={dirs.addFolder} />
      {dirs.renamingFolder && (
        <RenameDirectoryModal
          folderName={dirs.renamingFolder.name}
          isSaving={Boolean(dirs.renamingFolderId)}
          onClose={() => {
            if (!dirs.renamingFolderId) dirs.setRenamingFolder(null);
          }}
          onSubmit={dirs.handleRenameSubmit}
        />
      )}
      {dirs.deletingFolder && (
        <DeleteDirectoryModal
          folderName={dirs.deletingFolder.name}
          isDeleting={Boolean(dirs.deletingFolderId)}
          onClose={() => {
            if (!dirs.deletingFolderId) dirs.setDeletingFolder(null);
          }}
          onConfirm={dirs.handleDeleteConfirm}
        />
      )}
      {dirs.isCreateOpen && (
        <CreateDirectoryModal
          isCreating={dirs.isCreatingFolder}
          onClose={() => {
            if (!dirs.isCreatingFolder) dirs.setIsCreateOpen(false);
          }}
          onSubmit={dirs.handleCreateSubmit}
        />
      )}
    </>
  );
}