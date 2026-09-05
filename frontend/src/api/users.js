/**
 * Users API
 *
 * Backend:
 *   GET /api/users            — весь список пользователей. ТОЛЬКО Admin (403 иначе).
 *   GET /api/users/search?q=… — поиск по email/имени/фамилии, доступен любому
 *                                аутентифицированному пользователю. Возвращает
 *                                минимальный публичный набор полей (без surname/role).
 *
 * UserResponse fields (только для Admin, list()):
 *   id (UUID), name, surname, email, birthdayDate, registrationDate, role
 *
 * UserSearchResponse fields (search()):
 *   id (UUID), email, name
 */

import { api } from "./client.js";

/**
 * Загружает полный список пользователей. Доступно только Admin — использовать
 * для Sharing/резолва произвольных userId НЕЛЬЗЯ, обычный пользователь получит 403.
 *
 * @returns {Promise<object[]>}
 */
export function list() {
  return api.get("/api/users");
}

/**
 * Ищет пользователей по подстроке (email/имя/фамилия). Доступно любому
 * аутентифицированному пользователю — используется в Sharing для поиска, кого
 * добавить к заметке. Пустой query на backend вернёт пустой список.
 *
 * @param {string} query
 * @returns {Promise<{ id: string, email: string, name: string }[]>}
 */
export function search(query) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  return api.get(`/api/users/search?${params.toString()}`);
}
