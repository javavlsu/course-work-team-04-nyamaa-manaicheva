/**
 * Permissions API
 *
 * Backend: GET /api/notes/{noteId}/permissions
 * Доступно ТОЛЬКО владельцу заметки (PermissionAccessService.GetPermissionsByNoteId
 * бросает 403, если currentUserId != note.ownerId).
 *
 * Response: PermissionAccessResponse[] (обычный массив, не PageResponse)
 * PermissionAccessResponse fields:
 *   id (UUID), type (View | Edit), noteId (UUID), userId (UUID), directoryId (UUID | null)
 *
 * Update — вне текущего этапа, добавляется позже.
 */

import { api } from "./client.js";

/**
 * Загружает список permissions заметки. Вызывающая сторона должна убедиться,
 * что текущий пользователь — владелец заметки, иначе backend вернёт 403.
 *
 * @param {string} noteId
 * @returns {Promise<object[]>}
 */
export function list(noteId) {
  return api.get(`/api/notes/${noteId}/permissions`);
}

/**
 * Выдаёт доступ к заметке. Доступно только владельцу ресурса.
 * Фактически upsert: если у пользователя уже есть permission на этот ресурс,
 * backend обновит type вместо создания дубликата. Ровно один из noteId/directoryId
 * должен быть задан (backend вернёт 400 иначе). Нельзя выдать самому себе/владельцу (400).
 *
 * @param {{ type: "View" | "Edit", noteId: string, userId: string, directoryId?: string | null }} data
 * @returns {Promise<object>} PermissionAccessResponse
 */
export function grant({ type, noteId, userId, directoryId = null }) {
  return api.post("/api/permissions", { type, noteId, userId, directoryId });
}

/**
 * Отзывает доступ. Доступно только владельцу ресурса, к которому относится permission.
 *
 * @param {string} permissionId
 * @returns {Promise<void>}
 */
export function remove(permissionId) {
  return api.delete(`/api/permissions/${permissionId}`);
}
