/**
 * Attachments API
 *
 * Backend contracts (AttachmentContracts.java):
 *   AttachmentResponse: { id, noteId, fileName, contentType, fileSize, storageKey, createdAt, createdById }
 *   AttachmentDownloadResponse: { url, expiresAt }
 *
 * Limit: 20 MB (backend возвращает 413 Payload Too Large при превышении).
 *
 * DELETE /api/attachments/{id} требует canEditNote (владелец заметки или Edit-доступ,
 * не привязано к авторству вложения) — см. AttachmentController.java.
 */

import { api } from "./client.js";

/**
 * Загружает список вложений заметки.
 * Backend возвращает обычный массив AttachmentResponse[], не PageResponse.
 *
 * @param {string} noteId
 * @returns {Promise<object[]>}
 */
export function list(noteId) {
  return api.get(`/api/notes/${noteId}/attachments`);
}

/**
 * Загружает файл-вложение к заметке.
 *
 * @param {string} noteId
 * @param {File} file
 * @returns {Promise<object>} AttachmentResponse
 */
export function upload(noteId, file) {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/api/notes/${noteId}/attachments`, formData);
}

/**
 * Получает временную presigned-ссылку на скачивание файла (MinIO).
 * Upload response не содержит url напрямую (только storageKey), поэтому
 * для скачивания всегда нужен отдельный запрос.
 *
 * @param {string} attachmentId
 * @returns {Promise<{ url: string, expiresAt: string }>}
 */
export function getDownloadUrl(attachmentId) {
  return api.get(`/api/attachments/${attachmentId}`);
}

/**
 * Удаляет вложение. Доступно владельцу заметки или пользователю с Edit-доступом
 * (backend вернёт 403 иначе, независимо от того, кто загрузил файл).
 *
 * @param {string} attachmentId
 * @returns {Promise<void>}
 */
export function remove(attachmentId) {
  return api.delete(`/api/attachments/${attachmentId}`);
}
