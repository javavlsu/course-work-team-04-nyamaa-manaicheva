import { SendIcon } from "./icons";

export default function CommentsSection({ comments, draft, onDraftChange, onSend }) {
  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3>Комментарии</h3>
        <span className="comments-count">{comments.length}</span>
      </div>
      <div className="comments-list">
        {comments.map((comment, i) => (
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
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="comment-input-row">
        <div className="comment-avatar">АВ</div>
        <input
          type="text"
          placeholder="Написать комментарий…"
          value={draft}
          onChange={onDraftChange}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
        />
        <button className="comment-send" title="Отправить" onClick={onSend}>
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
