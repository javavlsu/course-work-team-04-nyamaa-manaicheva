import { api } from "./client.js";

export function list(noteId) {
  return api.get(`/api/notes/${noteId}/attachments`);
}

export function upload(noteId, file) {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/api/notes/${noteId}/attachments`, formData);
}

export function getDownloadUrl(attachmentId) {
  return api.get(`/api/attachments/${attachmentId}`);
}

export function remove(attachmentId) {
  return api.delete(`/api/attachments/${attachmentId}`);
}
