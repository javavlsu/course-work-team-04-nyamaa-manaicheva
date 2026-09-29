import { api } from "./client.js";

export function search(query) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  return api.get(`/api/users/search?${params.toString()}`);
}

export function update(id, data) {
  return api.put(`/api/users/${id}`, data);
}

export function remove(id) {
  return api.delete(`/api/users/${id}`);
}

export function changePassword(id, data) {
  return api.put(`/api/users/${id}/password`, data);
}
