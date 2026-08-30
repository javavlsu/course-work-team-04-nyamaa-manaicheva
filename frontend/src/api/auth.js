/**
 * Auth API
 *
 * Backend contracts (AuthContracts.java):
 *   LoginRequest:    { email, password }
 *   LoginResponse:   { userId, email }
 *
 *   RegisterRequest: { name, surname, email, birthdayDate?, password, passwordConfirm }
 *   RegisterResponse: 201 No Content
 *
 * Logout: POST /logout (Spring Security, не /api/logout)
 *
 * Получение текущего пользователя: GET /api/users/{userId}
 * (endpoint /api/users/me не существует — используем userId из LoginResponse)
 */

import { api } from "./client.js";

/**
 * Вход в систему.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ userId: string, email: string }>}
 */
export async function login(email, password) {
  return api.post("/api/auth/login", { email, password });
}

/**
 * Регистрация нового пользователя.
 *
 * @param {{ name: string, surname: string, email: string, password: string, passwordConfirm: string, birthdayDate?: string|null }} data
 * @returns {Promise<void>}
 */
export async function register({ name, surname, email, birthdayDate, password, passwordConfirm }) {
  return api.post("/api/auth/register", {
    name,
    surname,
    email,
    birthdayDate: birthdayDate || null,
    password,
    passwordConfirm,
  });
}

/**
 * Выход из системы.
 * Spring Security обрабатывает POST /logout (не /api/logout).
 * Vite proxy настроен на проксирование /logout → backend.
 *
 * @returns {Promise<void>}
 */
export async function logout() {
  return api.post("/logout", undefined);
}

/**
 * Получение данных текущего пользователя по userId.
 * Используется для восстановления auth state при перезагрузке страницы.
 *
 * Backend: GET /api/users/{id}
 * UserResponse: { id, name, surname, email, birthdayDate, registrationDate, role }
 *
 * @param {string} userId
 * @returns {Promise<object>}
 */
export async function getCurrentUser(userId) {
  return api.get(`/api/users/${userId}`);
}
