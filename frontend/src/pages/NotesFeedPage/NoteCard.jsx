import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVertical, Folder } from "lucide-react";

import { StarIcon } from "./icons";
import FolderSelector from "../../components/FolderSelector";
import { CreateDirectoryModal } from "../../components/DirectoryModal";

/**
 * Вытаскивает читаемый текст-preview из поля content.
 *
 * Backend хранит content как Object (может быть строкой-Markdown,
 * JSON-объектом для структурированных типов, или null).
 * Для карточки нам нужен просто текст ≤ нескольких строк.
 */
function extractExcerpt(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  // Если content — объект (например, JSON для Kanban/Table) — сериализуем как fallback
  try {
    return JSON.stringify(content);
  } catch {
    return "";
  }
}

/**
 * Форматирует ISO-дату в читаемый вид «14 авг 2026».
 * Если дата некорректна — возвращает пустую строку.
 */
function formatDate(isoString) {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Маппинг noteType (backend enum) → человекочитаемый тег на карточке.
 */
const NOTE_TYPE_LABELS = {
  Empty:    "Заметка",
  List:     "Список",
  Table:    "Таблица",
  Kanban:   "Канбан",
  Calendar: "Календарь",
};

function NoteCard({ note, folders = [], onToggle, onMove, onRemove, onCreateAndMove }) {
  const navigate = useNavigate();
  const excerpt = extractExcerpt(note.content ?? note.excerpt);
  const createdAt = formatDate(note.createDate ?? note.createdAt);
  const favorited = note.isFavourite ?? note.favorited ?? false;
  const tag = NOTE_TYPE_LABELS[note.noteType] ?? note.tag ?? "";
  const folderId = note.folderId ?? null;
  const folderName = folderId ? folders.find((f) => String(f.id) === String(folderId))?.name : null;

  const [isOpen, setIsOpen] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const handleMoveClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    setShowSelector(true);
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onRemove) onRemove(note.id);
  };

  const handleCreateClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onCreateAndMove) setShowCreateModal(true);
  };

  const handleSelectFolder = (targetId) => {
    setShowSelector(false);
    if (onMove) onMove(note.id, targetId);
  };

  const handleCreateFromSelector = () => {
    setShowSelector(false);
    if (onCreateAndMove) setShowCreateModal(true);
  };

  const handleCreateSubmit = async (title) => {
    if (!onCreateAndMove || isCreatingFolder) return;
    setIsCreatingFolder(true);
    try {
      await onCreateAndMove(note.id, title);
      setShowCreateModal(false);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  return (
    <>
      <div className="note-card" data-folder={note.folder} onClick={() => navigate(`/notes/${note.id}`)}>
        <div className="note-card-header">
          <span className="note-card-title">{note.title || "Без названия"}</span>
          <div className="note-card-header-actions">
            <StarIcon
              filled={favorited}
              className={`note-card-star${favorited ? " favorited" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggle) onToggle(note.id);
              }}
            />
            <div className="note-actions" ref={menuRef}>
              <button
                className="actions-btn"
                aria-label="Меню заметки"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen((v) => !v);
                }}
              >
                <EllipsisVertical size={16} />
              </button>
              {isOpen && (
                <div className="dropdown-menu">
                  {folderId ? (
                    <>
                      <button className="dropdown-item" onClick={handleMoveClick}>Переместить в другую папку</button>
                      <button className="dropdown-item dropdown-item-danger" onClick={handleRemoveClick}>Удалить из папки</button>
                    </>
                  ) : (
                    <>
                      <button className="dropdown-item" onClick={handleMoveClick}>Выбрать папку</button>
                      <button className="dropdown-item" onClick={handleCreateClick}>Создать папку и переместить</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="note-card-preview">{excerpt}</p>
        {folderId && folderName && (
          <div className="note-folder-badge">
            <Folder size={12} />
            <span>{folderName}</span>
          </div>
        )}
        <div className="note-card-footer">
          <span className="note-card-meta">{createdAt}</span>
          {tag && <span className="note-card-tag">{tag}</span>}
          {note.avatars && (
            <div className="note-card-avatars">
              {note.avatars.map((initials) => (
                <div className="avatar-sm" key={initials}>{initials}</div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showSelector && (
        <FolderSelector
          folders={folders}
          currentFolderId={folderId}
          onSelect={handleSelectFolder}
          onCreate={handleCreateFromSelector}
          onClose={() => setShowSelector(false)}
        />
      )}
      {showCreateModal && (
        <CreateDirectoryModal
          isCreating={isCreatingFolder}
          onClose={() => {
            if (!isCreatingFolder) setShowCreateModal(false);
          }}
          onSubmit={handleCreateSubmit}
        />
      )}
    </>
  );
}

export default NoteCard;
