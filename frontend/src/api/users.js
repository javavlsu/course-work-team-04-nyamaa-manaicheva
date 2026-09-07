/**
 * Users API
 *
 * Backend:
 *   GET /api/users/search?q=… — поиск по email/имени/фамилии, доступен любому
 *                                аутентифицированному пользователю. Возвращает
 *                                минимальный публичный набор полей (без surname/role).
 *   PUT /api/users/{id}       — обновление профиля (только сам пользователь или Admin).
 *   DELETE /api/users/{id}    — удаление аккаунта (только сам пользователь или Admin);
 *                               409, если с пользователем связаны данные.
 *
 * UserSearchResponse fields (search()):
 *   id (UUID), email, name
 *
 * UpdateUserRequest: { name, surname, email, birthdayDate, role } — все поля
 *   опциональны; role меняет только Admin. Лишнего не отправляем.
 */

import { api } from "./client.js";

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

/**
 * Обновляет профиль текущего (или любого, если Admin) пользователя.
 * Backend: PUT /api/users/{id} с UpdateUserRequest { name, surname, email, birthdayDate }.
 * Отправляем только данные профиля — role не передаём (его меняет только Admin).
 *
 * @param {string} id
 * @param {{ name: string, surname: string, email: string, birthdayDate?: string|null }} data
 * @returns {Promise<object>} обновлённый UserResponse
 */
export function update(id, data) {
  return api.put(`/api/users/${id}`, data);
}

/**
 * Удаляет аккаунт (только сам пользователь или Admin).
 * Backend: DELETE /api/users/{id}. 409 — если с аккаунтом связаны заметки,
 * директории или другие данные (удалить такой аккаунт нельзя).
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
export function remove(id) {
  return api.delete(`/api/users/${id}`);
}
