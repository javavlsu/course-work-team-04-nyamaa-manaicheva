export const blankNote = {
  title: "",
  content: "",
  createdAt: "только что",
  updatedAt: "только что",
};

/**
 * Извлекает текстовое представление поля content для textarea/preview.
 * Backend хранит content как Object: обычно строка Markdown для заметок
 * типа Empty, либо структурированный JSON для List/Table/Kanban/Calendar.
 * Редактор пока рассчитан на Markdown-текст, поэтому объектный content
 * сериализуется как JSON-фоллбэк (полноценная поддержка типов — вне Stage 4A).
 */
export function extractContentText(content) {
  if (content === null || content === undefined) return "";
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return "";
  }
}

/** Форматирует ISO-дату в «14 авг 2026, 10:32». */
export function formatDateTime(isoString) {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/**
 * Адаптирует CommentResponse backend { id, noteId, authorId, content, createdAt, updatedAt }
 * под формат, который уже ожидает CommentsSection: { author, initials, time, text }.
 * Backend не возвращает имя автора (только authorId UUID), поэтому отображаем
 * короткий идентификатор вместо полного имени (резолв через users API — вне Stage 6A).
 */
export function adaptComment(comment) {
  const authorId = comment.authorId || "";
  const shortId = authorId.replace(/-/g, "").slice(0, 6).toUpperCase();
  return {
    id: comment.id,
    authorId,
    author: shortId ? `Пользователь ${shortId}` : "Пользователь",
    initials: shortId.slice(0, 2) || "??",
    time: formatDateTime(comment.createdAt),
    text: comment.content ?? "",
  };
}

/**
 * Адаптирует PermissionAccessResponse backend { id, type, noteId, userId, directoryId }
 * под формат, который уже ожидает PrivacyMenu: { name, initials, role }.
 * Backend не возвращает имя пользователя (только userId). Для уже выданных permissions
 * (loadPermissions) имя больше недоступно обычному пользователю — GET /api/users стал
 * admin-only — показываем заглушку "Неизвестный пользователь". При добавлении нового
 * пользователя (addShareUser) имя берётся из GET /api/users/search, который возвращает
 * только { id, email, name } (без surname), поэтому surname обрабатывается как опциональный.
 * id и userId сохраняются в адаптированном объекте для grant/update/revoke.
 */
export function adaptPermission(permission, user) {
  let name = "Неизвестный пользователь";
  let initials = "??";

  if (user) {
    name = user.surname ? `${user.name} ${user.surname}`.trim() : (user.name || name);
    initials = user.surname
      ? `${(user.name?.[0] || "").toUpperCase()}${(user.surname?.[0] || "").toUpperCase()}`
      : (user.name || "").slice(0, 2).toUpperCase() || "??";
  }

  return {
    id: permission.id,
    userId: permission.userId,
    name,
    initials,
    role: permission.type === "Edit" ? "Редактирование" : "Просмотр",
  };
}