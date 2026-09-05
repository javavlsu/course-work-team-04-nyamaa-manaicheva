import { RotateCcw, Trash2 } from "lucide-react";

/**
 * Маппинг noteType (backend enum) → человекочитаемый тег.
 * Дублирует NOTE_TYPE_LABELS из NotesFeedPage/NoteCard.jsx — там он не экспортируется,
 * а заводить общий модуль ради одного объекта не входит в задачу.
 */
const NOTE_TYPE_LABELS = {
  Empty: "Заметка",
  List: "Список",
  Table: "Таблица",
  Kanban: "Канбан",
  Calendar: "Календарь",
};

/**
 * Вытаскивает читаемый текст-preview из поля content (та же логика, что в NoteCard).
 */
function extractExcerpt(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content);
  } catch {
    return "";
  }
}

/**
 * Форматирует ISO-дату в читаемый вид «14 авг 2026».
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

function TrashItem({ note, isRestoring, isPurging, disabled, onRestore, onPurgeRequest }) {
  const excerpt = extractExcerpt(note.content);
  const deletedAt = formatDate(note.deletedAt);
  const tag = NOTE_TYPE_LABELS[note.noteType] ?? "";
  const busy = isRestoring || isPurging;

  return (
    <div className="trash-item">
      <div className="trash-item-main">
        <div className="trash-item-header">
          <span className="trash-item-title">{note.title || "Без названия"}</span>
          {tag && <span className="note-card-tag">{tag}</span>}
        </div>
        {excerpt && <p className="trash-item-preview">{excerpt}</p>}
        {deletedAt && <span className="trash-item-meta">Удалено: {deletedAt}</span>}
      </div>
      <div className="trash-item-actions">
        <button
          type="button"
          className="trash-action-btn"
          disabled={disabled || busy}
          onClick={onRestore}
        >
          <RotateCcw size={15} strokeWidth={1.8} />
          <span>{isRestoring ? "Восстановление…" : "Восстановить"}</span>
        </button>
        <button
          type="button"
          className="trash-action-btn trash-action-btn-danger"
          disabled={disabled || busy}
          onClick={onPurgeRequest}
        >
          <Trash2 size={15} strokeWidth={1.8} />
          <span>{isPurging ? "Удаление…" : "Удалить навсегда"}</span>
        </button>
      </div>
    </div>
  );
}

export default TrashItem;
