import { api } from "./client.js";

export function list(noteId) {
  return api.get(`/api/notes/${noteId}/permissions`);
}

export function grant({ type, noteId, userId, directoryId = null }) {
  return api.post("/api/permissions", { type, noteId, userId, directoryId });
}

export function remove(permissionId) {
  return api.delete(`/api/permissions/${permissionId}`);
}
