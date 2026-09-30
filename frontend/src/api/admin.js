import { api } from "./client.js";

const PAGE_LIMIT = 100;

export async function listAllUsers() {
  const users = [];
  let cursor = null;

  do {
    const params = new URLSearchParams({ limit: String(PAGE_LIMIT) });
    if (cursor) params.set("cursor", cursor);

    const page = await api.get(`/api/users?${params.toString()}`);
    users.push(...(page?.items ?? []));
    cursor = page?.hasMore ? page.nextCursor : null;
  } while (cursor);

  return users;
}

export function createUser(data) {
  return api.post("/api/users", {
    ...data,
    birthdayDate: data.birthdayDate || null,
  });
}

export function updateUser(id, data) {
  return api.put(`/api/users/${id}`, {
    ...data,
    birthdayDate: data.birthdayDate || null,
  });
}

export function changeRole(id, role) {
  return api.put(`/api/users/${id}/role`, { role });
}

export function deleteUser(id) {
  return api.delete(`/api/users/${id}`);
}

export function getLogs(lines) {
  const query = lines ? `?lines=${lines}` : "";
  return api.get(`/api/logs${query}`);
}
