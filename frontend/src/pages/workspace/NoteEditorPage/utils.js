export const blankNote = {
  title: "",
  content: "",
  createdAt: "только что",
  updatedAt: "только что",
};

export function extractContentText(content) {
  if (content === null || content === undefined) return "";
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return "";
  }
}

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

export function createBlankListContent() {
  return { items: [{ text: "", done: false }] };
}

export function createBlankTableContent() {
  return { rows: [["", "", ""], ["", "", ""]] };
}

export function parseListContent(content) {
  if (!content) return [];
  const rawItems = Array.isArray(content) ? content : Array.isArray(content?.items) ? content.items : null;
  if (!rawItems) return [];
  return rawItems.map((item) => {
    if (typeof item === "string") return { text: item, done: false };
    if (item && typeof item === "object") {
      return { text: typeof item.text === "string" ? item.text : "", done: Boolean(item.done) };
    }
    return { text: "", done: false };
  });
}

export function serializeListContent(items) {
  const normalized = (Array.isArray(items) ? items : []).map((item) => ({
    text: typeof item?.text === "string" ? item.text : "",
    done: Boolean(item?.done),
  }));
  return { items: normalized };
}

export function parseTableContent(content) {
  const rawRows = Array.isArray(content) ? content : Array.isArray(content?.rows) ? content.rows : null;
  if (!rawRows || rawRows.length === 0) return [[""]];
  const rows = rawRows.map((row) => (Array.isArray(row) ? row : []));
  const cols = rows.reduce((max, row) => Math.max(max, row.length), 1);
  return rows.map((row) => Array.from({ length: cols }, (_, i) => String(row[i] ?? "")));
}

export function serializeTableContent(rows) {
  const normalized = (Array.isArray(rows) ? rows : []).map((row) =>
    Array.isArray(row) ? row.map((cell) => String(cell ?? "")) : [],
  );
  return { rows: normalized };
}

export function listToMarkdown(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => `- [${item?.done ? "x" : " "}] ${item?.text ?? ""}`)
    .join("\n");
}

export function tableToMarkdown(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const cols = rows.reduce((max, row) => Math.max(max, row.length), 0);
  if (cols === 0) return "";
  const widths = [];
  for (let c = 0; c < cols; c++) {
    let max = 1;
    for (let r = 0; r < rows.length; r++) {
      max = Math.max(max, String(rows[r]?.[c] ?? "").trim().length);
    }
    widths.push(max);
  }
  const fmt = (cells) => "|" + cells.map((cell, c) => ` ${cell.padEnd(widths[c])} `).join("|") + "|";
  const separator = "|" + widths.map((w) => "-".repeat(w + 2)).join("|") + "|";
  const render = (row) => fmt(row.map((c) => String(c ?? "").trim()));
  return [render(rows[0]), separator, ...rows.slice(1).map(render)].join("\n");
}