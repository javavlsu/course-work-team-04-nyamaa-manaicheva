/**
 * Notes API
 *
 * Backend: GET /api/notes
 * Response: NotePageResponse { items: NoteResponse[], nextCursor: string|null, hasMore: boolean }
 *
 * NoteResponse fields:
 *   id (UUID), title, content (Object), createDate, updatedAt,
 *   deletedAt, noteType, isFavourite, ownerId, version
 */

import { api } from "./client.js";

/**
 * Загружает страницу заметок с поддержкой cursor-based pagination.
 *
 * @param {{ search?: string, noteType?: string, isFavourite?: boolean, limit?: number, cursor?: string|null }} params
 * @returns {Promise<{ items: object[], nextCursor: string|null, hasMore: boolean }>}
 */
export function list({ search, noteType, isFavourite, limit = 20, cursor } = {}) {
  const params = new URLSearchParams();

  if (search)                      params.set("search", search);
  if (noteType)                    params.set("noteType", noteType);
  if (isFavourite !== undefined)   params.set("isFavourite", String(isFavourite));
  if (limit)                       params.set("limit", String(limit));
  if (cursor)                      params.set("cursor", cursor);

  const qs = params.toString();
  return api.get(`/api/notes${qs ? `?${qs}` : ""}`);
}

/**
 * Получает одну заметку по UUID.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export function get(id) {
  return api.get(`/api/notes/${id}`);
}

/**
 * Создаёт новую заметку.
 *
 * @param {{ title: string, content?: object, noteType?: string, isFavourite?: boolean }} data
 * @returns {Promise<object>}
 */
export function create(data) {
  return api.post("/api/notes", data);
}

/**
 * Обновляет заметку. Поддерживает optimistic locking через expectedVersion.
 *
 * @param {string} id
 * @param {{ title?: string, content?: object, expectedVersion?: number }} data
 * @returns {Promise<object>}
 */
export function update(id, data) {
  return api.put(`/api/notes/${id}`, data);
}

/**
 * Переключает флаг isFavourite у заметки.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export function toggleFavourite(id) {
  return api.patch(`/api/notes/${id}/favourite`);
}

/**
 * Удаляет заметку (только владелец).
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
export function remove(id) {
  return api.delete(`/api/notes/${id}`);
}

/**
 * Загружает список удалённых заметок (корзину) текущего пользователя.
 *
 * Backend: GET /api/notes/trash
 * Response: NoteResponse[] (без пагинации)
 *
 * @returns {Promise<object[]>}
 */
export function listTrash() {
  return api.get("/api/notes/trash");
}

/**
 * Восстанавливает заметку из корзины (снимает soft-delete).
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export function restore(id) {
  return api.patch(`/api/notes/${id}/restore`);
}

/**
 * Безвозвратно удаляет заметку из корзины вместе со всеми связями
 * (ревизии, теги, вложения, комментарии, доступы) и файлами в MinIO.
 * Необратимо; можно вызывать только для заметок, уже находящихся в корзине.
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
export function purge(id) {
  return api.delete(`/api/notes/${id}/purge`);
}
