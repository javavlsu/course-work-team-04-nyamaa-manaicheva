/**
 * Users API
 *
 * Backend: GET /api/users
 * Response: UserResponse[] (весь список пользователей, без query-параметров поиска —
 * backend не поддерживает фильтрацию/пагинацию для этого endpoint).
 *
 * UserResponse fields:
 *   id (UUID), name, surname, email, birthdayDate, registrationDate, role
 */

import { api } from "./client.js";

/**
 * Загружает полный список пользователей.
 * Используется для резолва userId → имя (например, в permissions) и для
 * будущего поиска пользователей при расшаривании (фильтрация — на клиенте).
 *
 * @returns {Promise<object[]>}
 */
export function list() {
  return api.get("/api/users");
}
