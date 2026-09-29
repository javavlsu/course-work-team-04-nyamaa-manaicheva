import { useCallback, useState } from "react";

import * as attachmentsApi from "@/api/attachments.js";

export function useNoteAttachments(id, isNew) {
  const [attachments, setAttachments] = useState([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState(null);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState(null);
  const [attachmentDownloadError, setAttachmentDownloadError] = useState(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);
  const [confirmDeleteAttachment, setConfirmDeleteAttachment] = useState(null);

  const load = useCallback(async () => {
    if (isNew) return;

    setAttachments([]);
    setAttachmentError(null);
    setAttachmentDownloadError(null);

    try {
      const data = await attachmentsApi.list(id);
      setAttachments(data ?? []);
    } catch (err) {
      setAttachmentError(err.message || "Не удалось загрузить вложения");
    }
  }, [id, isNew]);

  const upload = useCallback(
    async (file) => {
      if (isNew || isUploadingAttachment) return;

      setIsUploadingAttachment(true);
      setAttachmentError(null);

      try {
        const created = await attachmentsApi.upload(id, file);
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
    },
    [id, isNew, isUploadingAttachment],
  );

  const download = useCallback(
    async (attachment) => {
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
    },
    [isNew, downloadingAttachmentId],
  );

  const remove = useCallback(
    (attachment) => {
      if (isNew || deletingAttachmentId) return;
      setConfirmDeleteAttachment(attachment);
    },
    [isNew, deletingAttachmentId],
  );

  const confirmRemove = useCallback(async () => {
    if (!confirmDeleteAttachment) return;

    setDeletingAttachmentId(confirmDeleteAttachment.id);
    setAttachmentError(null);

    try {
      await attachmentsApi.remove(confirmDeleteAttachment.id);
      setAttachments((prev) => prev.filter((a) => a.id !== confirmDeleteAttachment.id));
    } catch (err) {
      setAttachmentError(err.message || "Не удалось удалить вложение");
    } finally {
      setDeletingAttachmentId(null);
      setConfirmDeleteAttachment(null);
    }
  }, [confirmDeleteAttachment]);

  return {
    list: attachments,
    load,
    upload,
    download,
    remove,
    confirmRemove,
    isUploading: isUploadingAttachment,
    error: attachmentError,
    dismissError: () => setAttachmentError(null),
    downloadingId: downloadingAttachmentId,
    downloadError: attachmentDownloadError,
    deletingId: deletingAttachmentId,
    confirmDeleteAttachment,
    cancelDeleteAttachment: () => setConfirmDeleteAttachment(null),
  };
}