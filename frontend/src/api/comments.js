/**
 * Comments API
 *
 * Backend: GET /api/notes/{noteId}/comments
 * Response: CommentResponse[] (обычный массив, не PageResponse)
 *
 * CommentResponse fields:
 *   id (UUID), noteId (UUID), authorId (UUID), content, createdAt, updatedAt
 *
 * Update комментариев — вне текущего этапа, добавляется позже.
 */

import { api } from "./client.js";

/**
 * Загружает список комментариев к заметке.
 *
 * @param {string} noteId
 * @returns {Promise<object[]>}
 */
export function list(noteId) {
  return api.get(`/api/notes/${noteId}/comments`);
}

/**
 * Создаёт комментарий к заметке.
 *
 * @param {string} noteId
 * @param {{ content: string }} data
 * @returns {Promise<object>} CommentResponse
 */
export function create(noteId, data) {
  return api.post(`/api/notes/${noteId}/comments`, data);
}

/**
 * Удаляет комментарий. Только автор комментария может его удалить (backend вернёт 403 иначе).
 *
 * Backend route: DELETE /api/comments/{id} (без noteId в пути —
 * см. CommentController.java, комментарий адресуются по своему собственному id).
 *
 * @param {string} commentId
 * @returns {Promise<void>}
 */
export function remove(commentId) {
  return api.delete(`/api/comments/${commentId}`);
}
