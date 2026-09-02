/**
 * Directories API
 *
 * Backend: GET /api/directories
 * Response: DirectoryPageResponse { items: DirectoryResponse[], nextCursor: string|null, hasMore: boolean }
 *
 * DirectoryResponse fields:
 *   id (UUID), title, createdDate, ownerId, updatedAt, deletedAt, version
 */

import { api } from "./client.js";

/**
 * Загружает страницу директорий с поддержкой cursor-based pagination.
 *
 * @param {{ search?: string, limit?: number, cursor?: string|null }} params
 * @returns {Promise<{ items: object[], nextCursor: string|null, hasMore: boolean }>}
 */
export function list({ search, limit = 20, cursor } = {}) {
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  if (limit)  params.set("limit", String(limit));
  if (cursor) params.set("cursor", cursor);

  const qs = params.toString();
  return api.get(`/api/directories${qs ? `?${qs}` : ""}`);
}

/**
 * Получает одну директорию по UUID.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export function get(id) {
  return api.get(`/api/directories/${id}`);
}

/**
 * Создаёт новую директорию.
 *
 * @param {{ title: string }} data
 * @returns {Promise<object>}
 */
export function create(data) {
  return api.post("/api/directories", data);
}

/**
 * Обновляет директорию (только владелец).
 *
 * @param {string} id
 * @param {{ title?: string, expectedVersion?: number }} data
 * @returns {Promise<object>}
 */
export function update(id, data) {
  return api.put(`/api/directories/${id}`, data);
}

/**
 * Удаляет директорию (только владелец).
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
export function remove(id) {
  return api.delete(`/api/directories/${id}`);
}

/**
 * Список заметок внутри директории (обычный массив, не PageResponse).
 *
 * @param {string} id
 * @returns {Promise<object[]>}
 */
export function listNotes(id) {
  return api.get(`/api/directories/${id}/notes`);
}

/**
 * Добавляет заметку в директорию. Требует владение И директорией, И заметкой
 * (backend вернёт 403 иначе — см. DirectoryController.addNoteToDirectory). Body не нужен,
 * оба идентификатора передаются в path. Одна заметка может одновременно состоять
 * в нескольких директориях — ограничение "одна заметка = одна директория"
 * на backend отсутствует.
 *
 * @param {string} directoryId
 * @param {string} noteId
 * @returns {Promise<{ noteId: string, directoryId: string }>} DirectoryNoteResponse
 */
export function addNote(directoryId, noteId) {
  return api.post(`/api/directories/${directoryId}/notes/${noteId}`, undefined);
}

/**
 * Убирает заметку из директории. Требует владение директорией
 * (backend вернёт 403 иначе).
 *
 * @param {string} directoryId
 * @param {string} noteId
 * @returns {Promise<void>}
 */
export function removeNote(directoryId, noteId) {
  return api.delete(`/api/directories/${directoryId}/notes/${noteId}`);
}
