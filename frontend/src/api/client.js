/**
 * Базовый API клиент.
 *
 * - Все запросы идут через Vite/nginx proxy: /api/... → backend:8080
 * - credentials: 'include' обязателен для session cookie
 * - Ошибки нормализуются в объект { status, message }
 */

/**
 * Выбрасывает нормализованную ошибку для HTTP-ответов с кодом >= 400.
 * Пробует прочитать { message } из тела ответа, иначе использует статус-текст.
 *
 * @param {Response} response
 * @returns {Promise<never>}
 */
async function throwApiError(response) {
  let message = response.statusText || "Неизвестная ошибка";

  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await response.json();
      if (body && typeof body.message === "string" && body.message) {
        message = body.message;
      }
    }
  } catch {
    // ignore parse errors — используем statusText
  }

  const error = new Error(message);
  error.status = response.status;
  throw error;
}

/**
 * Универсальный fetch wrapper.
 *
 * @param {string} path      — путь вида /api/auth/login
 * @param {RequestInit} [options]
 * @returns {Promise<any>}   — распарсенный JSON или undefined (для 204/пустого тела)
 */
export async function request(path, options = {}) {
  const { headers: extraHeaders, body, ...rest } = options;

  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  // Если body уже FormData — не ставим Content-Type (браузер сам проставит boundary)
  if (body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(path, {
    ...rest,
    headers,
    body,
    credentials: "include",
  });

  if (!response.ok) {
    await throwApiError(response);
  }

  // 204 No Content и пустые тела
  const contentType = response.headers.get("content-type") || "";
  if (response.status === 204 || !contentType.includes("application/json")) {
    return undefined;
  }

  return response.json();
}

export const api = {
  get: (path, options) =>
    request(path, { ...options, method: "GET" }),

  post: (path, data, options) =>
    request(path, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  put: (path, data, options) =>
    request(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: (path, data, options) =>
    request(path, {
      ...options,
      method: "PATCH",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),

  delete: (path, options) =>
    request(path, { ...options, method: "DELETE" }),
};
