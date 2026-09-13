import { useEffect, useLayoutEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { RenameDirectoryModal, DeleteDirectoryModal, CreateDirectoryModal } from "@/components/modals/DirectoryModal";
import NotesGrid from "@/components/notes/NotesGrid";
import EmptyState from "@/components/notes/EmptyState";
import FabGroup from "@/components/notes/FabGroup";
import { updateNotesCounts, useNotesCounts } from "@/hooks/useNotesCounts.js";
import { useDirectories } from "./hooks/useDirectories";
import FolderCard from "./components/FolderCard";
import "./DirectoriesPage.css";

export function DirectoriesPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { setSidebarProps } = useOutletContext();

  const dirs = useDirectories({ folderId });
  const sidebarCounts = useNotesCounts({ autoFetch: true });

  useEffect(() => {
    if (!dirs.isLoading) {
      updateNotesCounts({ directoriesCount: dirs.folders.length });
    }
  }, [dirs.isLoading, dirs.folders]);

  useLayoutEffect(() => {
    setSidebarProps({
      active: "directories",
      counts: {
        all: sidebarCounts.totalNotesCount ?? undefined,
        directories: dirs.isLoading ? undefined : dirs.folders.length,
        favorites: sidebarCounts.favouritesCount ?? undefined,
      },
      onSelectAll: () => navigate("/"),
    });
  }, [setSidebarProps, navigate, sidebarCounts, dirs.isLoading, dirs.folders]);

  return (
    <>
      <div className="topbar">
          <div className="topbar-left">
            {folderId && (
              <button onClick={() => navigate("/directories")} className="back-button">
                <ArrowLeft size={20} />
              </button>
            )}
            <span className="topbar-title">{dirs.pageTitle}</span>
            {!folderId && (
              <span className="topbar-count">
                {dirs.folders.length} папок
              </span>
            )}
            {folderId && (
              <span className="topbar-count">
                {dirs.folderNotes.length} заметок
              </span>
            )}
          </div>
          <div className="topbar-right">
            {folderId && dirs.folderDetail && (
              <>
                <button
                  type="button"
                  className="topbar-action-btn"
                  title="Изменить директорию"
                  aria-label="Изменить директорию"
                  disabled={Boolean(dirs.renamingFolderId || dirs.deletingFolderId)}
                  onClick={() => dirs.handleRenameFolder(dirs.folderDetail)}
                >
                  <Pencil size={16} strokeWidth={1.8} />
                  <span>Изменить</span>
                </button>
                <button
                  type="button"
                  className="topbar-action-btn topbar-action-btn-danger"
                  title="Удалить директорию"
                  aria-label="Удалить директорию"
                  disabled={Boolean(dirs.renamingFolderId || dirs.deletingFolderId)}
                  onClick={() => dirs.handleDeleteFolder(dirs.folderDetail)}
                >
                  <Trash2 size={16} strokeWidth={1.8} />
                  <span>Удалить</span>
                </button>
              </>
            )}
          </div>
        </div>

        {dirs.folderActionError && (
          <div className="directory-action-error" role="alert">
            <span>{dirs.folderActionError}</span>
            <button type="button" onClick={() => dirs.setFolderActionError(null)}>
              Скрыть
            </button>
          </div>
        )}

        {dirs.isLoading && (
          <div className="notes-loading">
            <div className="notes-loading-spinner" />
            <span>Загрузка…</span>
          </div>
        )}

        {!dirs.isLoading && dirs.error && (
          <div className="notes-error">
            <p>{dirs.error}</p>
            <button className="btn btn-secondary" onClick={dirs.fetchAll}>
              Попробовать снова
            </button>
          </div>
        )}

        {!dirs.isLoading && !dirs.error && (
          <>
            {!folderId && (
              <div className="directories-page">
                <div className="folders-grid">
                  {dirs.foldersWithCount.length === 0 ? (
                    <p className="folders-status">Папок нет</p>
                  ) : (
                    dirs.foldersWithCount.map((folder) => (
                      <FolderCard
                        key={folder.key}
                        folder={folder}
                        onClick={() => navigate(`/directories/${folder.id}`)}
                        onRename={dirs.handleRenameFolder}
                        onDelete={dirs.handleDeleteFolder}
                        isBusy={
                          dirs.renamingFolderId === (folder.id ?? folder.key) ||
                          dirs.deletingFolderId === (folder.id ?? folder.key)
                        }
                      />
                    ))
                  )}
                </div>
                {dirs.displayNotes.length > 0 ? (
                  <NotesGrid notes={dirs.displayNotes} folders={dirs.foldersWithCount} onToggle={dirs.toggleFavorite} onMove={dirs.handleMoveNote} onRemove={dirs.handleRemoveNote} onCreateAndMove={dirs.handleCreateAndMove} />
                ) : (
                  <EmptyState />
                )}
              </div>
            )}
            {folderId && (
              <div className="directories-page directories-page-detail">
                {dirs.displayNotes.length > 0 ? (
                  <NotesGrid notes={dirs.displayNotes} folders={dirs.foldersWithCount} onToggle={dirs.toggleFavorite} onMove={dirs.handleMoveNote} onRemove={dirs.handleRemoveNote} onCreateAndMove={dirs.handleCreateAndMove} />
                ) : (
                  <EmptyState />
                )}
              </div>
            )}
          </>
        )}
      <FabGroup
        onNewFolder={() => {
          dirs.setFolderActionError(null);
          dirs.setIsCreateOpen(true);
        }}
      />
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
          isCreating={dirs.isCreating}
          onClose={() => {
            if (!dirs.isCreating) dirs.setIsCreateOpen(false);
          }}
          onSubmit={dirs.handleCreateSubmit}
        />
      )}
    </>
  );
}
