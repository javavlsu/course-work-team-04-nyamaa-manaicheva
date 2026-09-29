import { api } from "./client.js";

export function list({ search, limit = 20, cursor } = {}) {
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  if (limit)  params.set("limit", String(limit));
  if (cursor) params.set("cursor", cursor);

  const qs = params.toString();
  return api.get(`/api/directories${qs ? `?${qs}` : ""}`);
}

const LIST_ALL_MAX_PAGES = 100;

export async function listAll({ search } = {}) {
  const items = [];
  let cursor = null;

  for (let page = 0; page < LIST_ALL_MAX_PAGES; page += 1) {
    const res = await list({ search, limit: 100, cursor });
    items.push(...(res.items ?? []));
    if (!res.hasMore || !res.nextCursor) break;
    cursor = res.nextCursor;
  }

  return items;
}

export function get(id) {
  return api.get(`/api/directories/${id}`);
}

export function create(data) {
  return api.post("/api/directories", data);
}

export function update(id, data) {
  return api.put(`/api/directories/${id}`, data);
}

export function remove(id) {
  return api.delete(`/api/directories/${id}`);
}

export function listNotes(id) {
  return api.get(`/api/directories/${id}/notes`);
}

export function addNote(directoryId, noteId) {
  return api.post(`/api/directories/${directoryId}/notes/${noteId}`, undefined);
}

export function removeNote(directoryId, noteId) {
  return api.delete(`/api/directories/${directoryId}/notes/${noteId}`);
}
