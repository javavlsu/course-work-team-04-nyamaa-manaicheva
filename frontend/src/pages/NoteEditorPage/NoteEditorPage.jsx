import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Download, Paperclip, Trash2 } from "lucide-react";

import * as notesApi from "../../api/notes.js";
import * as commentsApi from "../../api/comments.js";
import * as attachmentsApi from "../../api/attachments.js";
import * as permissionsApi from "../../api/permissions.js";
import * as usersApi from "../../api/users.js";
import AppSidebar from "../../components/layout/AppSidebar";
import { useAuth } from "../../context/AuthContext.jsx";
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

/**
 * Адаптирует CommentResponse backend { id, noteId, authorId, content, createdAt, updatedAt }
 * под формат, который уже ожидает CommentsSection: { author, initials, time, text }.
 * Backend не возвращает имя автора (только authorId UUID), поэтому отображаем
 * короткий идентификатор вместо полного имени (резолв через users API — вне Stage 6A).
 */
function adaptComment(comment) {
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
 * Backend не возвращает имя пользователя (только userId), поэтому имя резолвится
 * отдельно через users API (см. loadPermissions). id и userId сохраняются в адаптированном
 * объекте — они понадобятся для grant/update/revoke на следующих этапах.
 */
function adaptPermission(permission, user) {
  const name = user ? `${user.name} ${user.surname}`.trim() : "Неизвестный пользователь";
  const initials = user
    ? `${(user.name?.[0] || "").toUpperCase()}${(user.surname?.[0] || "").toUpperCase()}`
    : "??";
  return {
    id: permission.id,
    userId: permission.userId,
    name,
    initials,
    role: permission.type === "Edit" ? "Редактирование" : "Просмотр",
  };
}

export function NoteEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
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

  // --- Comments: GET /api/notes/:id/comments и POST ---
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [sendCommentError, setSendCommentError] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [commentDeleteError, setCommentDeleteError] = useState(null);

  // --- Attachments: POST /api/notes/:id/attachments ---
  const [attachments, setAttachments] = useState([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState(null);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState(null);
  const [attachmentDownloadError, setAttachmentDownloadError] = useState(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);

  // --- Permissions: GET /api/notes/:id/permissions (только для owner) ---
  const [ownerId, setOwnerId] = useState(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState(null);
  const [allUsers, setAllUsers] = useState([]); // кэш GET /api/users для поиска при добавлении
  const [isAddingShareUser, setIsAddingShareUser] = useState(false);
  const [removingShareUserId, setRemovingShareUserId] = useState(null);

  const [title, setTitle] = useState(isNew ? blankNote.title : "");
  const [content, setContent] = useState(isNew ? blankNote.content : "");
  const [favorited, setFavorited] = useState(false);
  const [createdAtRaw, setCreatedAtRaw] = useState(null);
  const [updatedAtRaw, setUpdatedAtRaw] = useState(null);

  // --- Sharing: privacy UI-состояние локально (link/public не поддерживаются backend);
  // shareUsers теперь заполняется реальными permissions (см. loadPermissions).
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacy, setPrivacy] = useState("private");
  const [shareUsers, setShareUsers] = useState([]);
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

  /**
   * Загружает комментарии к заметке. Недоступно для "new" (заметки ещё не существует на backend).
   * Вызывается после успешной загрузки заметки, а также доступна как retry при ошибке.
   */
  const loadComments = useCallback(async () => {
    if (isNew) return;

    setCommentsLoading(true);
    setCommentsError(null);

    try {
      const data = await commentsApi.list(id);
      setComments((data ?? []).map(adaptComment));
    } catch (err) {
      setCommentsError(err.message || "Не удалось загрузить комментарии");
    } finally {
      setCommentsLoading(false);
    }
  }, [id, isNew]);

  /**
   * Загружает список attachments заметки. Недоступно для "new" (заметки ещё не существует на backend).
   * Ошибка переиспользует уже существующий attachmentError/баннер, отдельного loading не вводим —
   * список просто появляется, когда готов.
   */
  const loadAttachments = useCallback(async () => {
    if (isNew) return;

    try {
      const data = await attachmentsApi.list(id);
      setAttachments(data ?? []);
    } catch (err) {
      setAttachmentError(err.message || "Не удалось загрузить вложения");
    }
  }, [id, isNew]);

  /**
   * Загружает permissions заметки и резолвит имена через GET /api/users.
   * Доступно только владельцу заметки — backend вернёт 403 иначе,
   * поэтому запрос вообще не делается, если currentUser не совпадает с ownerId.
   * ownerIdParam передаётся явно (а не читается из state ownerId), чтобы избежать
   * stale-чтения сразу после setOwnerId в том же синхронном блоке.
   */
  const loadPermissions = useCallback(async (ownerIdParam) => {
    if (isNew) return;
    if (!currentUser || ownerIdParam !== currentUser.id) return;

    setPermissionsLoading(true);
    setPermissionsError(null);

    try {
      const [permissionsList, users] = await Promise.all([
        permissionsApi.list(id),
        usersApi.list(),
      ]);
      const usersById = new Map(users.map((u) => [u.id, u]));
      setAllUsers(users ?? []);
      setShareUsers(
        (permissionsList ?? []).map((p) => adaptPermission(p, usersById.get(p.userId)))
      );
    } catch (err) {
      setPermissionsError(err.message || "Не удалось загрузить доступ к заметке");
    } finally {
      setPermissionsLoading(false);
    }
  }, [id, isNew, currentUser]);

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
        setOwnerId(data.ownerId ?? null);

        // Сбрасываем attachments при смене заметки перед загрузкой актуального списка.
        setAttachments([]);
        setAttachmentError(null);
        setAttachmentDownloadError(null);

        // Сбрасываем permissions перед загрузкой актуального списка (только для owner).
        setShareUsers([]);
        setPermissionsError(null);

        // Комментарии и attachments грузим только после успешной загрузки заметки,
        // у них своё независимое loading/error состояние, не блокируют рендер редактора.
        // ownerId передаётся из data.ownerId напрямую — setOwnerId выше ещё не применился к state.
        if (!cancelled) {
          loadComments();
          loadAttachments();
          loadPermissions(data.ownerId ?? null);
        }
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
  }, [id, isNew, loadComments, loadAttachments, loadPermissions]);

  /**
   * Добавляет пользователя в список доступа. Ищет совпадение по email/имени среди уже
   * загруженного allUsers (из loadPermissions), так как backend не даёт серверный поиск.
   * Владелец заметки не может быть добавлен сам себе (backend всё равно вернёт 400,
   * но проверяем на клиенте, чтобы не делать заведомо бесполезный запрос). Защита от
   * повторной отправки через isAddingShareUser. Новый permission id не генерируется локально —
   * берётся из ответа backend через уже существующий adaptPermission.
   */
  const addShareUser = async (draftValue) => {
    if (isNew || isAddingShareUser) return;

    const trimmed = draftValue.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const matched = allUsers.find((u) => {
      const email = (u.email || "").toLowerCase();
      const fullName = `${u.name || ""} ${u.surname || ""}`.toLowerCase();
      return email === lower || fullName.includes(lower);
    });

    if (!matched) {
      setPermissionsError("Пользователь не найден");
      return;
    }

    if (matched.id === ownerId) {
      setPermissionsError("Нельзя добавить владельца заметки");
      return;
    }

    if (shareUsers.some((u) => u.userId === matched.id)) {
      setPermissionsError("Этот пользователь уже добавлен");
      return;
    }

    setIsAddingShareUser(true);
    setPermissionsError(null);

    try {
      const created = await permissionsApi.grant({
        type: "View",
        noteId: id,
        userId: matched.id,
      });
      // В список добавляется именно permission из ответа backend (с реальным id).
      setShareUsers((prev) => [...prev, adaptPermission(created, matched)]);
    } catch (err) {
      // 400 (например, попытка добавить владельца) или 403 (не владелец ресурса) —
      // пользователь в UI не добавляется.
      setPermissionsError(err.message || "Не удалось предоставить доступ");
    } finally {
      setIsAddingShareUser(false);
    }
  };

  /**
   * Убирает доступ пользователя (revoke). PrivacyMenu передаёт индекс в массиве shareUsers
   * (onRemove(i) не менялся) — реальный permission.id для DELETE берётся из shareUsers[index],
   * а не из самого индекса. Перед запросом — window.confirm. Защита от повторной
   * отправки через removingShareUserId. При ошибке пользователь остаётся в списке.
   */
  const removeShareUser = async (index) => {
    if (isNew || removingShareUserId) return;

    const target = shareUsers[index];
    if (!target) return;

    const confirmed = window.confirm(`Убрать доступ пользователя «${target.name}»?`);
    if (!confirmed) return;

    setRemovingShareUserId(target.id);
    setPermissionsError(null);

    try {
      await permissionsApi.remove(target.id);
      // Локально фильтруем по permission.id (не по индексу) — повторный GET не делается.
      setShareUsers((prev) => prev.filter((u) => u.id !== target.id));
    } catch (err) {
      // Ошибка — пользователь остаётся в списке.
      setPermissionsError(err.message || "Не удалось убрать доступ");
    } finally {
      setRemovingShareUserId(null);
    }
  };

  const addComment = async () => {
    // "new" — заметки ещё не существует на backend, создавать комментарий некуда.
    if (isNew) return;
    // Защита от повторной отправки пока запрос уже в полёте.
    if (isSendingComment) return;

    const text = commentDraft.trim();
    if (!text) return;

    setIsSendingComment(true);
    setSendCommentError(null);

    try {
      const created = await commentsApi.create(id, { content: text });
      // В список добавляется именно комментарий из ответа backend (с реальным id и createdAt),
      // локальный id не генерируется. Повторный GET списка не нужен — response уже содержит всё необходимое.
      setComments((prev) => [...prev, adaptComment(created)]);
      setCommentDraft("");
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch (err) {
      // Ошибка — комментарий локально не добавляется, черновик остаётся как есть
      setSendCommentError(err.message || "Не удалось отправить комментарий");
    } finally {
      setIsSendingComment(false);
    }
  };

  /**
   * Удаляет комментарий. Перед запросом — window.confirm. Защита от повторной
   * отправки через deletingCommentId. При ошибке комментарий остаётся в списке.
   * Повторный GET не делается — локально фильтруем удалённый id из comments.
   */
  const handleDeleteComment = async (commentId) => {
    if (deletingCommentId) return;

    const confirmed = window.confirm("Удалить этот комментарий?");
    if (!confirmed) return;

    setDeletingCommentId(commentId);
    setCommentDeleteError(null);

    try {
      await commentsApi.remove(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setCommentDeleteError(err.message || "Не удалось удалить комментарий");
    } finally {
      setDeletingCommentId(null);
    }
  };

  /**
   * Загружает файл-вложение к заметке сразу после выбора файла в FormatToolbar.
   * Недоступно для "new" (заметка ещё не существует на backend — кнопка дизейблена через uploadDisabled).
   * Защита от повторной отправки через isUploadingAttachment. 413 от backend (лимит 20 МБ)
   * показывается отдельным понятным сообщением.
   */
  const handleAttachmentUpload = async (file) => {
    if (isNew || isUploadingAttachment) return;

    setIsUploadingAttachment(true);
    setAttachmentError(null);

    try {
      const created = await attachmentsApi.upload(id, file);
      // Добавляем в уже загруженный список без повторного GET.
      setAttachments((prev) => [...prev, created]);
    } catch (err) {
      if (err.status === 413) {
        setAttachmentError("Файл превышает лимит 20 МБ");
      } else {
        setAttachmentError(err.message || "Не удалось загрузить файл");
      }
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  /**
   * Получает presigned-ссылку и открывает её в новой вкладке. Upload response не содержит
   * url напрямую, поэтому требуется отдельный запрос GET /api/attachments/{id}.
   * Защита от повторной отправки через downloadingAttachmentId.
   */
  const handleDownloadAttachment = async (attachment) => {
    if (isNew || downloadingAttachmentId) return;

    setDownloadingAttachmentId(attachment.id);
    setAttachmentDownloadError(null);

    try {
      const { url } = await attachmentsApi.getDownloadUrl(attachment.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setAttachmentDownloadError(err.message || "Не удалось получить ссылку для скачивания");
    } finally {
      setDownloadingAttachmentId(null);
    }
  };

  /**
   * Удаляет вложение. Перед запросом — window.confirm. Защита от повторной
   * отправки через deletingAttachmentId. Права проверяет только backend (canEditNote) —
   * кнопка показывается всегда, ошибка 403 отобразится через тот же attachmentError.
   * Повторный GET не делается — локально фильтруем удалённый id из attachments.
   */
  const handleDeleteAttachment = async (attachment) => {
    if (isNew || deletingAttachmentId) return;

    const confirmed = window.confirm(`Удалить вложение «${attachment.fileName}»?`);
    if (!confirmed) return;

    setDeletingAttachmentId(attachment.id);
    setAttachmentError(null);

    try {
      await attachmentsApi.remove(attachment.id);
      setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
    } catch (err) {
      setAttachmentError(err.message || "Не удалось удалить вложение");
    } finally {
      setDeletingAttachmentId(null);
    }
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
        {/* Загрузка/ошибка attachment — минимальный state, переиспользованы те же баннеры, что и для save */}
        {attachmentError && (
          <div className="editor-save-banner editor-save-banner-generic">
            <span>{attachmentError}</span>
            <div className="editor-save-banner-actions">
              <button
                className="editor-save-banner-dismiss"
                onClick={() => setAttachmentError(null)}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
        {isUploadingAttachment && (
          <div className="editor-save-banner">
            <span>Загрузка файла…</span>
          </div>
        )}
        {/* Ошибка загрузки permissions — минимальный state, тот же баннер, что и для attachment */}
        {permissionsError && (
          <div className="editor-save-banner editor-save-banner-generic">
            <span>{permissionsError}</span>
            <div className="editor-save-banner-actions">
              <button
                className="editor-save-banner-dismiss"
                onClick={() => setPermissionsError(null)}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
        <div className="editor-content-wrap">
          {mode === "edit" && (
            <FormatToolbar
              onFileSelect={handleAttachmentUpload}
              isUploading={isUploadingAttachment}
              uploadDisabled={isNew}
            />
          )}
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

            {/* Список загруженных в этой сессии attachments (state из Stage 7A). Для "new" не показываемся. */}
            {!isNew && attachments.length > 0 && (
              <div className="attachments-section">
                <div className="comments-header">
                  <h3>Вложения</h3>
                  <span className="comments-count">{attachments.length}</span>
                </div>
                <div className="attachments-list">
                  {attachments.map((att) => (
                    <div className="attachment-item" key={att.id}>
                      <Paperclip strokeWidth={1.6} className="attachment-icon" />
                      <span className="attachment-name">{att.fileName}</span>
                      <button
                        className="attachment-download"
                        title="Скачать"
                        onClick={() => handleDownloadAttachment(att)}
                        disabled={downloadingAttachmentId === att.id}
                      >
                        {downloadingAttachmentId === att.id ? (
                          "Открытие…"
                        ) : (
                          <Download strokeWidth={1.6} />
                        )}
                      </button>
                      <button
                        className="attachment-download"
                        title="Удалить"
                        onClick={() => handleDeleteAttachment(att)}
                        disabled={deletingAttachmentId === att.id}
                      >
                        {deletingAttachmentId === att.id ? (
                          "Удаление…"
                        ) : (
                          <Trash2 strokeWidth={1.6} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                {attachmentDownloadError && (
                  <p className="comments-status comments-status-error">
                    {attachmentDownloadError}
                  </p>
                )}
              </div>
            )}

            <CommentsSection
              comments={comments}
              draft={commentDraft}
              onDraftChange={(e) => setCommentDraft(e.target.value)}
              onSend={addComment}
              isLoading={commentsLoading}
              error={commentsError}
              onRetry={loadComments}
              isSending={isSendingComment}
              sendError={sendCommentError}
              currentUserId={currentUser?.id}
              onDeleteComment={handleDeleteComment}
              deletingCommentId={deletingCommentId}
              deleteError={commentDeleteError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
