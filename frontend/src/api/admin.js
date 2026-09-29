/**
 * Admin API
 *
 * Backend:
 *   GET    /api/users?limit&cursor      — список пользователей (только Admin), UserPageResponse
 *   POST   /api/users                   — создать пользователя с ролью (только Admin)
 *   PUT    /api/users/{id}              — обновить профиль (Admin — любого)
 *   PUT    /api/users/{id}/role         — сменить роль (только Admin, не себе → 403)
 *   DELETE /api/users/{id}/with-data    — удалить пользователя вместе со всеми данными (только Admin)
 *   GET    /api/logs?lines              — хвост лог-файла: { available, content } (только Admin)
 *
 * UserResponse: { id, name, surname, email, birthdayDate, registrationDate, role }
 * CreateUserRequest: { name, surname, email, birthdayDate, password, role }
 */

import { api } from "./client.js";

const PAGE_LIMIT = 100;

/**
 * Загружает всех пользователей, проходя по страницам курсора.
 *
 * @returns {Promise<object[]>}
 */
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

/**
 * @param {{ name: string, surname: string, email: string, birthdayDate?: string|null, password: string, role: "Admin"|"Client" }} data
 * @returns {Promise<object>} созданный UserResponse
 */
export function createUser(data) {
  return api.post("/api/users", {
    ...data,
    birthdayDate: data.birthdayDate || null,
  });
}

/**
 * @param {string} id
 * @param {{ name: string, surname: string, email: string, birthdayDate?: string|null }} data
 * @returns {Promise<object>} обновлённый UserResponse
 */
export function updateUser(id, data) {
  return api.put(`/api/users/${id}`, {
    ...data,
    birthdayDate: data.birthdayDate || null,
  });
}

/**
 * @param {string} id
 * @param {"Admin"|"Client"} role
 * @returns {Promise<object>} обновлённый UserResponse
 */
export function changeRole(id, role) {
  return api.put(`/api/users/${id}/role`, { role });
}

/**
 * Удаляет пользователя вместе со всеми его данными (заметки, директории и т.д.).
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
export function deleteUser(id) {
  return api.delete(`/api/users/${id}/with-data`);
}

/**
 * @param {number} [lines] сколько последних строк лога вернуть
 * @returns {Promise<{ available: boolean, content: string }>}
 */
export function getLogs(lines) {
  const query = lines ? `?lines=${lines}` : "";
  return api.get(`/api/logs${query}`);
}
