import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import * as notesApi from "../../api/notes.js";
import AppSidebar from "../../components/layout/AppSidebar";
import { mockComments } from "../../lib/utils/mockData";
import EditorTopbar from "./EditorTopbar";
import FormatToolbar from "./FormatToolbar";
import MarkdownArea from "./MarkdownArea";
import CommentsSection from "./CommentsSection";
import "./NoteEditorPage.css";

const blankNote = {
  title: "",
  content: "",
  createdAt: "только что",
  updatedAt: "только что",
};

const initialShareUsers = [
  { name: "Мария К.", initials: "МК", role: "Редактирование" },
  { name: "Дмитрий С.", initials: "ДС", role: "Просмотр" },
];

/**
 * Извлекает текстовое представление поля content для textarea/preview.
 * Backend хранит content как Object: обычно строка Markdown для заметок
 * типа Empty, либо структурированный JSON для List/Table/Kanban/Calendar.
 * Редактор пока рассчитан на Markdown-текст, поэтому объектный content
 * сериализуется как JSON-фоллбэк (полноценная поддержка типов — вне Stage 4A).
 */
function extractContentText(content) {
  if (content === null || content === undefined) return "";
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return "";
  }
}

/** Форматирует ISO-дату в «14 авг 2026, 10:32». */
function formatDateTime(isoString) {
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

export function NoteEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [collapsed, setCollapsed] = useState(false);
  const [mode, setMode] = useState("edit");

  // --- Загрузка существующей заметки: GET /api/notes/:id ---
  const [isLoading, setIsLoading] = useState(!isNew);
  const [error, setError] = useState(null); // { type: "not-found" | "generic", message }

  // version сохраняется для optimistic locking (PUT с expectedVersion).
  const [version, setVersion] = useState(null);

  // --- Save state (PUT/POST /api/notes) ---
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState(null); // { type: "conflict" | "generic", message }

  // --- Delete state (DELETE /api/notes/:id) ---
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState(isNew ? blankNote.title : "");
  const [content, setContent] = useState(isNew ? blankNote.content : "");
  const [favorited, setFavorited] = useState(false);
  const [createdAtRaw, setCreatedAtRaw] = useState(null);
  const [updatedAtRaw, setUpdatedAtRaw] = useState(null);

  // --- Sharing/comments — UI-only заглушки, не входят в Stage 4A ---
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacy, setPrivacy] = useState("private");
  const [shareUsers, setShareUsers] = useState(initialShareUsers);
  const [comments, setComments] = useState(mockComments);
  const [commentDraft, setCommentDraft] = useState("");

  const privacyWrapRef = useRef(null);

  // Хранит id только что созданной через POST заметки, чтобы эффект загрузки
  // ниже не делал GET сразу после navigate("/notes/:newId") — данные уже есть из ответа create().
  const justCreatedIdRef = useRef(null);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (
        privacyWrapRef.current &&
        !privacyWrapRef.current.contains(e.target)
      ) {
        setPrivacyOpen(false);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () =>
      document.removeEventListener("click", handleDocumentClick);
  }, []);

  // Загрузка заметки при монтировании / смене id.
  // "new" — заметки ещё не существует на backend, используем blankNote локально.
  useEffect(() => {
    if (isNew) return;

    // Данные уже загружены из ответа POST /api/notes в handleSave — повторный GET не нужен.
    if (justCreatedIdRef.current === id) {
      justCreatedIdRef.current = null;
      return;
    }

    let cancelled = false;

    async function fetchNote() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await notesApi.get(id);
        if (cancelled) return;

        // Адаптация NoteResponse → поля редактора
        setTitle(data.title ?? "");
        setContent(extractContentText(data.content));
        setFavorited(Boolean(data.isFavourite));
        setVersion(data.version ?? null);
        setCreatedAtRaw(data.createDate ?? null);
        setUpdatedAtRaw(data.updatedAt ?? null);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 404) {
          setError({ type: "not-found", message: "Заметка не найдена" });
        } else {
          setError({
            type: "generic",
            message: err.message || "Не удалось загрузить заметку",
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchNote();
    return () => { cancelled = true; };
  }, [id, isNew]);

  const addShareUser = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const initials = trimmed
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    setShareUsers([
      ...shareUsers,
      { name: trimmed, initials, role: "Просмотр" },
    ]);
  };

  const removeShareUser = (index) => {
    setShareUsers(shareUsers.filter((_, i) => i !== index));
  };

  const addComment = () => {
    const text = commentDraft.trim();
    if (!text) return;
    setComments([
      ...comments,
      { author: "Алексей В.", initials: "АВ", time: "только что", text },
    ]);
    setCommentDraft("");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleExport = () => {
    const safeTitle = title || "Без названия";
    const blob = new Blob([content], { type: "text/markdown; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      safeTitle
        .replace(/[^a-zA-Zа-яА-Я0-9_\- ]/g, "")
        .trim()
        .replace(/\s+/g, "-") + ".md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    // Защита от повторной отправки пока запрос уже в полёте (общая для create и update).
    if (isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      if (isNew) {
        // Backend contract POST /api/notes: { title, content, noteType, isFavourite }
        // noteType в редакторе пока не выбирается UI — используем "Empty" по умолчанию.
        const created = await notesApi.create({
          title,
          content,
          noteType: "Empty",
          isFavourite: favorited,
        });

        // Обновляем данные из ответа backend — так же, как и после GET/PUT
        setTitle(created.title ?? title);
        setContent(extractContentText(created.content));
        setFavorited(Boolean(created.isFavourite));
        setVersion(created.version ?? null);
        setCreatedAtRaw(created.createDate ?? null);
        setUpdatedAtRaw(created.updatedAt ?? null);

        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);

        // Помечаем id, чтобы эффект загрузки не делал лишний GET после перехода
        justCreatedIdRef.current = created.id;
        navigate(`/notes/${created.id}`, { replace: true });
        return;
      }

      // expectedVersion берётся только из state, полученного при последнем GET/PUT —
      // никогда не генерируется на frontend.
      const updated = await notesApi.update(id, {
        title,
        content,
        expectedVersion: version,
      });

      // Обновляем данные из ответа backend — в том числе новый version
      setTitle(updated.title ?? title);
      setContent(extractContentText(updated.content));
      setFavorited(Boolean(updated.isFavourite));
      setVersion(updated.version ?? version);
      setUpdatedAtRaw(updated.updatedAt ?? updatedAtRaw);

      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      if (err.status === 409) {
        // Optimistic locking conflict — не перезаписываем локальные title/content.
        setSaveError({
          type: "conflict",
          message:
            "Заметка была изменена в другом месте. Загрузите актуальную версию, чтобы продолжить.",
        });
      } else {
        setSaveError({
          type: "generic",
          message:
            err.message ||
            (isNew ? "Не удалось создать заметку" : "Не удалось сохранить заметку"),
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * После 409 Conflict пользователь может перезагрузить актуальную версию заметки
   * с backend (GET /api/notes/:id). Локальные title/content/version при этом перезаписываются
   * намеренно — это явное действие пользователя, а не автоматический откат.
   */
  const handleReloadAfterConflict = async () => {
    setIsSaving(true);
    try {
      const data = await notesApi.get(id);
      setTitle(data.title ?? "");
      setContent(extractContentText(data.content));
      setFavorited(Boolean(data.isFavourite));
      setVersion(data.version ?? null);
      setCreatedAtRaw(data.createDate ?? null);
      setUpdatedAtRaw(data.updatedAt ?? null);
      setSaveError(null);
    } catch (err) {
      setSaveError({
        type: "generic",
        message: err.message || "Не удалось загрузить актуальную версию",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Удаление заметки. Недоступно для "new" (кнопка в EditorTopbar дизейблена через deleteDisabled).
   * Перед запросом — window.confirm. Защита от повторной отправки через isDeleting.
   * Ошибка показывается через тот же баннер saveError, что и для save.
   */
  const handleDelete = async () => {
    if (isNew || isDeleting) return;

    const confirmed = window.confirm("Удалить эту заметку? Это действие нельзя отменить.");
    if (!confirmed) return;

    setIsDeleting(true);
    setSaveError(null);

    try {
      await notesApi.remove(id);
      navigate("/notes", { replace: true });
    } catch (err) {
      setSaveError({
        type: "generic",
        message: err.message || "Не удалось удалить заметку",
      });
      setIsDeleting(false);
    }
  };

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="app">
        <AppSidebar
          active=""
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <div className="main">
          <div className="editor-loading">
            <div className="editor-loading-spinner" />
            <span>Загрузка заметки…</span>
          </div>
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="app">
        <AppSidebar
          active=""
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <div className="main">
          <div className="editor-error">
            <p>{error.message}</p>
            <div className="editor-error-actions">
              {error.type !== "not-found" && (
                <button
                  className="btn btn-secondary"
                  onClick={() => window.location.reload()}
                >
                  Попробовать снова
                </button>
              )}
              <Link to="/notes" className="btn btn-secondary">
                Назад к заметкам
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const createdAtDisplay = isNew ? blankNote.createdAt : formatDateTime(createdAtRaw);
  const updatedAtDisplay = isNew ? blankNote.updatedAt : formatDateTime(updatedAtRaw);

  return (
    <div className="app">
      <AppSidebar
        active=""
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className="main">
        <EditorTopbar
          mode={mode}
          onModeChange={setMode}
          favorited={favorited}
          onToggleFavorite={() => setFavorited(!favorited)}
          privacyOpen={privacyOpen}
          onTogglePrivacy={() => setPrivacyOpen(!privacyOpen)}
          privacy={privacy}
          onSelectPrivacy={setPrivacy}
          privacyWrapRef={privacyWrapRef}
          shareUsers={shareUsers}
          onAddShareUser={addShareUser}
          onRemoveShareUser={removeShareUser}
          onExport={handleExport}
          onSave={handleSave}
          isSaving={isSaving}
          justSaved={justSaved}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          deleteDisabled={isNew}
        />

        {/* Ошибка сохранения — в т.ч. 409 Conflict. Локальные title/content не затираются. */}
        {saveError && (
          <div className={`editor-save-banner editor-save-banner-${saveError.type}`}>
            <span>{saveError.message}</span>
            <div className="editor-save-banner-actions">
              {saveError.type === "conflict" && (
                <button className="btn btn-secondary" onClick={handleReloadAfterConflict}>
                  Загрузить актуальную версию
                </button>
              )}
              <button
                className="editor-save-banner-dismiss"
                onClick={() => setSaveError(null)}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
        <div className="editor-content-wrap">
          {mode === "edit" && <FormatToolbar />}
          {/* data-note-version хранит текущий version для optimistic locking, не влияет на UI */}
          <div className="editor-body" data-note-version={version ?? undefined}>
            <MarkdownArea
              mode={mode}
              title={title}
              onTitleChange={(e) => setTitle(e.target.value)}
              content={content}
              onContentChange={(e) => setContent(e.target.value)}
            />
            <div className="note-dates">
              <span>Создано: {createdAtDisplay}</span>
              <span>Изменено: {updatedAtDisplay}</span>
            </div>
            <CommentsSection
              comments={comments}
              draft={commentDraft}
              onDraftChange={(e) => setCommentDraft(e.target.value)}
              onSend={addComment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
