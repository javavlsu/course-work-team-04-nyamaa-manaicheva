import { SendIcon } from "./icons";

export default function CommentsSection({
  comments,
  draft,
  onDraftChange,
  onSend,
  isLoading = false,
  error = null,
  onRetry,
  isSending = false,
  sendError = null,
  currentUserId,
  onDeleteComment,
  deletingCommentId = null,
  deleteError = null,
}) {
  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3>Комментарии</h3>
        <span className="comments-count">{comments.length}</span>
      </div>
      <div className="comments-list">
        {isLoading && <p className="comments-status">Загрузка комментариев…</p>}

        {!isLoading && error && (
          <p className="comments-status comments-status-error">
            {error}{" "}
            <button className="editor-save-banner-dismiss" onClick={onRetry}>
              Повторить
            </button>
          </p>
        )}

        {!isLoading && !error && comments.map((comment, i) => (
          <div className="comment" key={`${comment.author}-${i}`}>
            <div
              className={
                comment.avatarClass
                  ? `comment-avatar ${comment.avatarClass}`
                  : "comment-avatar"
              }
            >
              {comment.initials}
            </div>
            <div className="comment-body">
              <div className="comment-meta">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-time">{comment.time}</span>
              </div>
              <div className="comment-text">{comment.text}</div>
              <div className="comment-actions">
                <span className="comment-action">Ответить</span>
                {onDeleteComment && currentUserId && comment.authorId === currentUserId && (
                  <span
                    className="comment-action"
                    onClick={() => onDeleteComment(comment.id)}
                    style={
                      deletingCommentId === comment.id
                        ? { opacity: 0.5, pointerEvents: "none" }
                        : undefined
                    }
                  >
                    {deletingCommentId === comment.id ? "Удаление…" : "Удалить"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {deleteError && (
        <p className="comments-status comments-status-error">{deleteError}</p>
      )}
      <div className="comment-input-row">
        <div className="comment-avatar">АВ</div>
        <input
          type="text"
          placeholder="Написать комментарий…"
          value={draft}
          onChange={onDraftChange}
          onKeyDown={(e) => e.key === "Enter" && !isSending && onSend()}
          disabled={isSending}
        />
        <button
          className="comment-send"
          title="Отправить"
          onClick={onSend}
          disabled={isSending}
        >
          <SendIcon />
        </button>
      </div>
      {sendError && (
        <p className="comments-status comments-status-error">{sendError}</p>
      )}
    </div>
  );
}
