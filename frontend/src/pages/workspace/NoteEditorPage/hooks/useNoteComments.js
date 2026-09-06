import { useCallback, useState } from "react";

import * as commentsApi from "../../../../api/comments.js";
import { adaptComment } from "../utils";

export function useNoteComments(id, isNew) {
  // --- Comments: GET /api/notes/:id/comments и POST ---
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [sendCommentError, setSendCommentError] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [commentDeleteError, setCommentDeleteError] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");

  /**
   * Загружает комментарии к заметке. Недоступно для "new" (заметки ещё не существует на backend).
   * Вызывается после успешной загрузки заметки, а также доступна как retry при ошибке.
   */
  const load = useCallback(async () => {
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

  const add = useCallback(async () => {
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
  }, [id, isNew, isSendingComment, commentDraft]);

  /**
   * Удаляет комментарий. Перед запросом — window.confirm. Защита от повторной
   * отправки через deletingCommentId. При ошибке комментарий остаётся в списке.
   * Повторный GET не делается — локально фильтруем удалённый id из comments.
   */
  const remove = useCallback(
    async (commentId) => {
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
    },
    [deletingCommentId],
  );

  return {
    list: comments,
    draft: commentDraft,
    onDraftChange: (e) => setCommentDraft(e.target.value),
    add,
    remove,
    load,
    isLoading: commentsLoading,
    error: commentsError,
    isSending: isSendingComment,
    sendError: sendCommentError,
    deletingId: deletingCommentId,
    deleteError: commentDeleteError,
  };
}