import { api } from "./client.js";

export function getMyBoard() {
  return api.get("/api/kanban/board");
}

export function createColumn(boardId, data) {
  return api.post(`/api/kanban/boards/${boardId}/columns`, data);
}

export function updateColumn(columnId, data) {
  return api.put(`/api/kanban/columns/${columnId}`, data);
}

export function deleteColumn(columnId) {
  return api.delete(`/api/kanban/columns/${columnId}`);
}

export function createTask(columnId, data) {
  return api.post(`/api/kanban/columns/${columnId}/tasks`, data);
}

export function updateTask(taskId, data) {
  return api.put(`/api/kanban/tasks/${taskId}`, data);
}

export function deleteTask(taskId) {
  return api.delete(`/api/kanban/tasks/${taskId}`);
}

export function moveTask(taskId, data) {
  return api.patch(`/api/kanban/tasks/${taskId}/move`, data);
}

export function archiveTask(taskId) {
  return api.patch(`/api/kanban/tasks/${taskId}/archive`);
}

export function unarchiveTask(taskId) {
  return api.patch(`/api/kanban/tasks/${taskId}/unarchive`);
}

export function getArchivedTasks() {
  return api.get("/api/kanban/tasks/archived");
}
