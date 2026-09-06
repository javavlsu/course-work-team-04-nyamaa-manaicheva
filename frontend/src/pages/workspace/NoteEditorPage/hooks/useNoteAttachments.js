import { useCallback, useState } from "react";

import * as attachmentsApi from "../../../../api/attachments.js";

export function useNoteAttachments(id, isNew) {
  // --- Attachments: POST /api/notes/:id/attachments ---
  const [attachments, setAttachments] = useState([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState(null);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState(null);
  const [attachmentDownloadError, setAttachmentDownloadError] = useState(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);

  /**
   * Загружает список attachments заметки. Недоступно для "new" (заметки ещё не существует на backend).
   * Перед загрузкой сбрасывает список и ошибки текущей заметки (при смене id), чтобы в UI
   * не остались вложения предыдущей заметки. Ошибка переиспользует attachmentError/баннер,
   * отдельного loading не вводим — список просто появляется, когда готов.
   */
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

  /**
   * Загружает файл-вложение к заметке сразу после выбора файла в FormatToolbar.
   * Недоступно для "new" (заметка ещё не существует на backend — кнопка дизейблена через uploadDisabled).
   * Защита от повторной отправки через isUploadingAttachment. 413 от backend (лимит 20 МБ)
   * показывается отдельным понятным сообщением.
   */
  const upload = useCallback(
    async (file) => {
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
    },
    [id, isNew, isUploadingAttachment],
  );

  /**
   * Получает presigned-ссылку и открывает её в новой вкладке. Upload response не содержит
   * url напрямую, поэтому требуется отдельный запрос GET /api/attachments/{id}.
   * Защита от повторной отправки через downloadingAttachmentId.
   */
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

  /**
   * Удаляет вложение. Перед запросом — window.confirm. Защита от повторной
   * отправки через deletingAttachmentId. Права проверяет только backend (canEditNote) —
   * кнопка показывается всегда, ошибка 403 отобразится через тот же attachmentError.
   * Повторный GET не делается — локально фильтруем удалённый id из attachments.
   */
  const remove = useCallback(
    async (attachment) => {
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
    },
    [isNew, deletingAttachmentId],
  );

  return {
    list: attachments,
    load,
    upload,
    download,
    remove,
    isUploading: isUploadingAttachment,
    error: attachmentError,
    dismissError: () => setAttachmentError(null),
    downloadingId: downloadingAttachmentId,
    downloadError: attachmentDownloadError,
    deletingId: deletingAttachmentId,
  };
}