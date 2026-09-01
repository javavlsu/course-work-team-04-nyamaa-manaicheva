/**
 * AuthContext
 *
 * Хранит состояние аутентификации и предоставляет методы login/logout.
 *
 * Стратегия восстановления auth state при перезагрузке:
 *   1. Читаем userId из localStorage (только как идентификатор,
 *      не как токен — сессия живёт в httpOnly cookie).
 *   2. Запрашиваем GET /api/users/{userId} с credentials:include.
 *   3. Если backend вернул 401/403/404 — сессия протухла, очищаем userId.
 *   4. Иначе — восстанавливаем currentUser.
 *
 * localStorage используется только для хранения userId (UUID строка),
 * а не для хранения сессии или токена.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCurrentUser, login as apiLogin, logout as apiLogout } from "../api/auth.js";

const AUTH_USER_ID_KEY = "nb_user_id";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  // true пока идёт начальная проверка сессии при загрузке приложения
  const [isLoading, setIsLoading] = useState(true);

  // Восстановление auth state при старте приложения
  useEffect(() => {
    const storedUserId = localStorage.getItem(AUTH_USER_ID_KEY);

    if (!storedUserId) {
      setIsLoading(false);
      return;
    }

    getCurrentUser(storedUserId)
      .then((user) => {
        setCurrentUser(user);
      })
      .catch((err) => {
        // 401/403/404 — сессия протухла или пользователь не найден
        if (err.status === 401 || err.status === 403 || err.status === 404) {
          localStorage.removeItem(AUTH_USER_ID_KEY);
        }
        // currentUser остаётся null
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  /**
   * Вход в систему.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   * @throws {Error} с полем .status и .message при ошибке API
   */
  const login = useCallback(async (email, password) => {
    const { userId } = await apiLogin(email, password);

    // Сохраняем userId для последующего восстановления сессии после перезагрузки
    localStorage.setItem(AUTH_USER_ID_KEY, userId);

    // Загружаем полные данные пользователя (name, surname, email, role, ...)
    const user = await getCurrentUser(userId);
    setCurrentUser(user);
  }, []);

  /**
   * Выход из системы.
   *
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Игнорируем ошибки logout на backend — всё равно очищаем локальное состояние
    } finally {
      localStorage.removeItem(AUTH_USER_ID_KEY);
      setCurrentUser(null);
    }
  }, []);

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: currentUser !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Хук для доступа к auth контексту.
 *
 * @returns {{ currentUser: object|null, isLoading: boolean, isAuthenticated: boolean, login: Function, logout: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
