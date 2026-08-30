import { useNavigate } from "react-router-dom";

import { StarIcon } from "./icons";

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

function NoteCard({ note, onToggle }) {
  const navigate = useNavigate();

  // Адаптируем backend NoteResponse → поля, которые ожидает UI
  // Backend: id (UUID), title, content, createDate, updatedAt, noteType, isFavourite
  // UI:      id,        title, excerpt, createdAt,             tag,      favorited
  const excerpt  = extractExcerpt(note.content ?? note.excerpt);
  const createdAt = formatDate(note.createDate ?? note.createdAt);
  const favorited  = note.isFavourite ?? note.favorited ?? false;
  const tag        = NOTE_TYPE_LABELS[note.noteType] ?? note.tag ?? "";

  return (
    <div
      className="note-card"
      data-folder={note.folder}
      onClick={() => navigate(`/notes/${note.id}`)}
    >
      <div className="note-card-header">
        <span className="note-card-title">{note.title || "Без названия"}</span>
        <StarIcon
          filled={favorited}
          className={`note-card-star${favorited ? " favorited" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(note.id);
          }}
        />
      </div>
      <p className="note-card-preview">{excerpt}</p>
      <div className="note-card-footer">
        <span className="note-card-meta">{createdAt}</span>
        {tag && <span className="note-card-tag">{tag}</span>}
        {note.avatars && (
          <div className="note-card-avatars">
            {note.avatars.map((initials) => (
              <div className="avatar-sm" key={initials}>
                {initials}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteCard;
