/**
 * Kanban API
 *
 * Backend: /api/kanban/...
 *
 * KanbanBoardResponse:  { id, ownerId, createdAt, updatedAt, columns: KanbanColumnResponse[] }
 * KanbanColumnResponse: { id, boardId, title, position, createdAt, updatedAt, tasks: KanbanTaskResponse[] }
 * KanbanTaskResponse:   { id, columnId, title, description, position, status, archived, noteId, createdAt, updatedAt }
 *
 * status: "Todo" | "InProgress" | "Done"
 */

import { api } from "./client.js";

/**
 * Доска текущего пользователя. Создаётся лениво на backend при первом обращении
 * (одна доска на пользователя) — отдельного createBoard не требуется.
 *
 * @returns {Promise<object>} KanbanBoardResponse
 */
export function getMyBoard() {
  return api.get("/api/kanban/board");
}

/**
 * @param {string} boardId
 * @param {{ title: string, position?: number }} data — position опционален (в конец, если не задан)
 * @returns {Promise<object>} KanbanColumnResponse
 */
export function createColumn(boardId, data) {
  return api.post(`/api/kanban/boards/${boardId}/columns`, data);
}

/**
 * @param {string} columnId
 * @param {{ title?: string, position?: number }} data — частичное обновление
 * @returns {Promise<object>} KanbanColumnResponse
 */
export function updateColumn(columnId, data) {
  return api.put(`/api/kanban/columns/${columnId}`, data);
}

/**
 * Удаляет колонку вместе со всеми задачами в ней (backend чистит зависимости).
 *
 * @param {string} columnId
 * @returns {Promise<void>}
 */
export function deleteColumn(columnId) {
  return api.delete(`/api/kanban/columns/${columnId}`);
}

/**
 * @param {string} columnId
 * @param {{ title: string, description?: string, position?: number, status?: string, noteId?: string }} data
 * @returns {Promise<object>} KanbanTaskResponse
 */
export function createTask(columnId, data) {
  return api.post(`/api/kanban/columns/${columnId}/tasks`, data);
}

/**
 * Частичное обновление задачи. Для переноса между колонками/смены позиции — moveTask,
 * для архивирования — archiveTask/unarchiveTask.
 *
 * @param {string} taskId
 * @param {{ title?: string, description?: string, status?: string }} data
 * @returns {Promise<object>} KanbanTaskResponse
 */
export function updateTask(taskId, data) {
  return api.put(`/api/kanban/tasks/${taskId}`, data);
}

/**
 * @param {string} taskId
 * @returns {Promise<void>}
 */
export function deleteTask(taskId) {
  return api.delete(`/api/kanban/tasks/${taskId}`);
}

/**
 * Переносит задачу в другую колонку и/или на другую позицию (drag & drop).
 *
 * @param {string} taskId
 * @param {{ targetColumnId?: string|null, position?: number|null }} data
 *   targetColumnId: null/undefined — перенос внутри текущей колонки.
 *   position: null/undefined — перенос в конец целевой колонки.
 * @returns {Promise<object>} KanbanTaskResponse
 */
export function moveTask(taskId, data) {
  return api.patch(`/api/kanban/tasks/${taskId}/move`, data);
}

/**
 * @param {string} taskId
 * @returns {Promise<object>} KanbanTaskResponse
 */
export function archiveTask(taskId) {
  return api.patch(`/api/kanban/tasks/${taskId}/archive`);
}

/**
 * @param {string} taskId
 * @returns {Promise<object>} KanbanTaskResponse
 */
export function unarchiveTask(taskId) {
  return api.patch(`/api/kanban/tasks/${taskId}/unarchive`);
}
