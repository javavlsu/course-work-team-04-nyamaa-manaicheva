import { api } from "./client.js";

export function list(noteId) {
  return api.get(`/api/notes/${noteId}/comments`);
}

export function create(noteId, data) {
  return api.post(`/api/notes/${noteId}/comments`, data);
}

export function remove(commentId) {
  return api.delete(`/api/comments/${commentId}`);
}
