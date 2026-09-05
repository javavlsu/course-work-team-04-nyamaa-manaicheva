import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Folder } from "lucide-react";

import * as notesApi from "../../api/notes.js";
import * as directoriesApi from "../../api/directories.js";
import AppSidebar from "../../components/layout/AppSidebar";
import NotesGrid from "../NotesFeedPage/NotesGrid";
import EmptyState from "../NotesFeedPage/EmptyState";
import "./DirectoriesPage.css";

const FOLDER_TINTS = ["tint-orange", "tint-green", "tint-purple", "tint-blue"];

function FolderCard({ folder, onClick }) {
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
      <div className={`folder-icon ${folder.tint || ""}`}>
        <Folder size={24} />
      </div>
      <div className="folder-info">
        <h3 className="folder-title">{folder.name}</h3>
        <span className="folder-count">{folder.notesCount ?? 0} заметок</span>
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

  const favoritesCount = notesWithFolderId.filter((n) => n.isFavourite).length;
  const unassignedNotes = notesWithFolderId.filter((n) => n.folderId === null || n.folderId === undefined);
  const folderNotes = folderId ? notesWithFolderId.filter((n) => String(n.folderId) === String(folderId)) : [];

  const displayNotes = folderId ? folderNotes : unassignedNotes;
  const pageTitle = folderId ? (folderDetail?.name || "Папка") : "Директории";

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
          <div className="topbar-right" />
        </div>

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
              displayNotes.length > 0 ? (
                <NotesGrid notes={displayNotes} folders={foldersWithCount} onToggle={toggleFavorite} onMove={handleMoveNote} onRemove={handleRemoveNote} onCreateAndMove={handleCreateAndMove} />
              ) : (
                <EmptyState />
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
