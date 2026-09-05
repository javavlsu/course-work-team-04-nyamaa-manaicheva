import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Folder, Pencil, Trash2 } from "lucide-react";

import * as notesApi from "../../api/notes.js";
import * as directoriesApi from "../../api/directories.js";
import AppSidebar from "../../components/layout/AppSidebar";
import { RenameDirectoryModal, DeleteDirectoryModal, CreateDirectoryModal } from "../../components/DirectoryModal";
import NotesGrid from "../NotesFeedPage/NotesGrid";
import EmptyState from "../NotesFeedPage/EmptyState";
import FabGroup from "../NotesFeedPage/FabGroup";
import "./DirectoriesPage.css";

const FOLDER_TINTS = ["tint-orange", "tint-green", "tint-purple", "tint-blue"];

function FolderCard({ folder, onClick, onRename, onDelete, isBusy = false }) {
  return (
    <div
      className="folder-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="folder-card-top">
        <div className={`folder-icon ${folder.tint || ""}`}>
          <Folder size={22} />
        </div>
        {(onRename || onDelete) && (
          <div className="folder-actions" onClick={(e) => e.stopPropagation()}>
            {onRename && (
              <button
                type="button"
                className="folder-action-btn"
                title="Изменить директорию"
                aria-label="Изменить директорию"
                disabled={isBusy}
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(folder);
                }}
              >
                <Pencil size={15} strokeWidth={1.8} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="folder-action-btn folder-action-btn-danger"
                title="Удалить директорию"
                aria-label="Удалить директорию"
                disabled={isBusy}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(folder);
                }}
              >
                <Trash2 size={15} strokeWidth={1.8} />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="folder-info">
        <h3 className="folder-title">{folder.name}</h3>
        <span className="folder-count">
          <span className="folder-count-dot" aria-hidden="true" />
          {folder.notesCount ?? 0} заметок
        </span>
      </div>
    </div>
  );
}

export function DirectoriesPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
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

  return (
    <div className="app">
      <AppSidebar
        active="directories"
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        counts={{ all: notes.length, directories: folders.length, favorites: favoritesCount }}
        onSelectAll={() => navigate("/")}
        onSelectFavorites={() => navigate("/")}
      />
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            {folderId && (
              <button onClick={() => navigate("/directories")} className="back-button">
                <ArrowLeft size={20} />
              </button>
            )}
            <span className="topbar-title">{pageTitle}</span>
            {!folderId && (
              <span style={{ fontSize: "14px", color: "var(--muted)", marginLeft: "8px" }}>
                {folders.length} папок
              </span>
            )}
            {folderId && (
              <span style={{ fontSize: "14px", color: "var(--muted)", marginLeft: "8px" }}>
                {folderNotes.length} заметок
              </span>
            )}
          </div>
          <div className="topbar-right">
            {folderId && folderDetail && (
              <>
                <button
                  type="button"
                  className="topbar-action-btn"
                  title="Изменить директорию"
                  aria-label="Изменить директорию"
                  disabled={Boolean(renamingFolderId || deletingFolderId)}
                  onClick={() => handleRenameFolder(folderDetail)}
                >
                  <Pencil size={16} strokeWidth={1.8} />
                  <span>Изменить</span>
                </button>
                <button
                  type="button"
                  className="topbar-action-btn topbar-action-btn-danger"
                  title="Удалить директорию"
                  aria-label="Удалить директорию"
                  disabled={Boolean(renamingFolderId || deletingFolderId)}
                  onClick={() => handleDeleteFolder(folderDetail)}
                >
                  <Trash2 size={16} strokeWidth={1.8} />
                  <span>Удалить</span>
                </button>
              </>
            )}
          </div>
        </div>

        {folderActionError && (
          <div className="directory-action-error" role="alert">
            <span>{folderActionError}</span>
            <button type="button" onClick={() => setFolderActionError(null)}>
              Скрыть
            </button>
          </div>
        )}

        {isLoading && (
          <div className="notes-loading">
            <div className="notes-loading-spinner" />
            <span>Загрузка…</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="notes-error">
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={fetchAll}>
              Попробовать снова
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {!folderId && (
              <div className="directories-page">
                <div className="folders-grid">
                  {foldersWithCount.length === 0 ? (
                    <p className="folders-status">Папок нет</p>
                  ) : (
                    foldersWithCount.map((folder) => (
                      <FolderCard
                        key={folder.key}
                        folder={folder}
                        onClick={() => navigate(`/directories/${folder.id}`)}
                        onRename={handleRenameFolder}
                        onDelete={handleDeleteFolder}
                        isBusy={
                          renamingFolderId === (folder.id ?? folder.key) ||
                          deletingFolderId === (folder.id ?? folder.key)
                        }
                      />
                    ))
                  )}
                </div>
                {displayNotes.length > 0 ? (
                  <NotesGrid notes={displayNotes} folders={foldersWithCount} onToggle={toggleFavorite} onMove={handleMoveNote} onRemove={handleRemoveNote} onCreateAndMove={handleCreateAndMove} />
                ) : (
                  <EmptyState />
                )}
              </div>
            )}
            {folderId && (
              <div className="directories-page directories-page-detail">
                {displayNotes.length > 0 ? (
                  <NotesGrid notes={displayNotes} folders={foldersWithCount} onToggle={toggleFavorite} onMove={handleMoveNote} onRemove={handleRemoveNote} onCreateAndMove={handleCreateAndMove} />
                ) : (
                  <EmptyState />
                )}
              </div>
            )}
          </>
        )}
      </div>
      <FabGroup
        onNewFolder={() => {
          setFolderActionError(null);
          setIsCreateOpen(true);
        }}
      />
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
          isCreating={isCreating}
          onClose={() => {
            if (!isCreating) setIsCreateOpen(false);
          }}
          onSubmit={handleCreateSubmit}
        />
      )}
    </div>
  );
}
