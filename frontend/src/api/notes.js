import { api } from "./client.js";

export function list({ search, noteType, isFavourite, limit = 20, cursor, sortBy, order } = {}) {
  const params = new URLSearchParams();

  if (search)                      params.set("search", search);
  if (noteType)                    params.set("noteType", noteType);
  if (isFavourite !== undefined)   params.set("isFavourite", String(isFavourite));
  if (limit)                       params.set("limit", String(limit));
  if (cursor)                      params.set("cursor", cursor);
  if (sortBy)                      params.set("sortBy", sortBy);
  if (order)                       params.set("order", order);

  const qs = params.toString();
  return api.get(`/api/notes${qs ? `?${qs}` : ""}`);
}

const LIST_ALL_MAX_PAGES = 100;

export async function listAll(params = {}) {
  const items = [];
  let cursor = null;

  for (let page = 0; page < LIST_ALL_MAX_PAGES; page += 1) {
    const res = await list({ ...params, limit: 100, cursor });
    items.push(...(res.items ?? []));
    if (!res.hasMore || !res.nextCursor) break;
    cursor = res.nextCursor;
  }

  return items;
}

export function get(id) {
  return api.get(`/api/notes/${id}`);
}

export function create(data) {
  return api.post("/api/notes", data);
}

export function update(id, data) {
  return api.put(`/api/notes/${id}`, data);
}

export function toggleFavourite(id) {
  return api.patch(`/api/notes/${id}/favourite`);
}

export function remove(id) {
  return api.delete(`/api/notes/${id}`);
}

export function listTrash() {
  return api.get("/api/notes/trash");
}

export function restore(id) {
  return api.patch(`/api/notes/${id}/restore`);
}

export function purge(id) {
  return api.delete(`/api/notes/${id}/purge`);
}
