import { Download, Paperclip, Trash2 } from "lucide-react";

export default function AttachmentsSection({
  attachments,
  onDownload,
  onDelete,
  downloadingId = null,
  deletingId = null,
  downloadError = null,
}) {
  return (
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
              onClick={() => onDownload(att)}
              disabled={downloadingId === att.id}
            >
              {downloadingId === att.id ? (
                "Открытие…"
              ) : (
                <Download strokeWidth={1.6} />
              )}
            </button>
            <button
              className="attachment-download"
              title="Удалить"
              onClick={() => onDelete(att)}
              disabled={deletingId === att.id}
            >
              {deletingId === att.id ? (
                "Удаление…"
              ) : (
                <Trash2 strokeWidth={1.6} />
              )}
            </button>
          </div>
        ))}
      </div>
      {downloadError && (
        <p className="comments-status comments-status-error">
          {downloadError}
        </p>
      )}
    </div>
  );
}