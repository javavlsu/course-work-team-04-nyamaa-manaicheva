import { useCallback, useState } from "react";

import * as commentsApi from "@/api/comments.js";
import { adaptComment } from "../utils";

export function useNoteComments(id, isNew) {
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [sendCommentError, setSendCommentError] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [commentDeleteError, setCommentDeleteError] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [confirmDeleteCommentId, setConfirmDeleteCommentId] = useState(null);

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
    if (isNew) return;
    if (isSendingComment) return;

    const text = commentDraft.trim();
    if (!text) return;

    setIsSendingComment(true);
    setSendCommentError(null);

    try {
      const created = await commentsApi.create(id, { content: text });
      setComments((prev) => [...prev, adaptComment(created)]);
      setCommentDraft("");
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch (err) {
      setSendCommentError(err.message || "Не удалось отправить комментарий");
    } finally {
      setIsSendingComment(false);
    }
  }, [id, isNew, isSendingComment, commentDraft]);

  const remove = useCallback(
    (commentId) => {
      if (deletingCommentId) return;
      setConfirmDeleteCommentId(commentId);
    },
    [deletingCommentId],
  );

  const confirmRemove = useCallback(async () => {
    if (!confirmDeleteCommentId) return;

    setDeletingCommentId(confirmDeleteCommentId);
    setCommentDeleteError(null);

    try {
      await commentsApi.remove(confirmDeleteCommentId);
      setComments((prev) => prev.filter((c) => c.id !== confirmDeleteCommentId));
    } catch (err) {
      setCommentDeleteError(err.message || "Не удалось удалить комментарий");
    } finally {
      setDeletingCommentId(null);
      setConfirmDeleteCommentId(null);
    }
  }, [confirmDeleteCommentId]);

  return {
    list: comments,
    draft: commentDraft,
    onDraftChange: (e) => setCommentDraft(e.target.value),
    add,
    remove,
    confirmRemove,
    load,
    isLoading: commentsLoading,
    error: commentsError,
    isSending: isSendingComment,
    sendError: sendCommentError,
    deletingId: deletingCommentId,
    deleteError: commentDeleteError,
    confirmDeleteCommentId,
    cancelDeleteComment: () => setConfirmDeleteCommentId(null),
  };
}