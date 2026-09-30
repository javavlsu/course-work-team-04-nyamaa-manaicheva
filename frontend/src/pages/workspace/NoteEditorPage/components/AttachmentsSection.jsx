import { Download, Paperclip, Trash2 } from "lucide-react";

import CollapsibleSection from "./CollapsibleSection";

export default function AttachmentsSection({
  attachments,
  onDownload,
  onDelete,
  downloadingId = null,
  deletingId = null,
  downloadError = null,
}) {
  return (
    <CollapsibleSection
      className="attachments-section"
      title="Вложения"
      count={attachments.length}
    >
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
    </CollapsibleSection>
  );
}