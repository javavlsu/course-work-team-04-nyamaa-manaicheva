import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCurrentUser, login as apiLogin, logout as apiLogout } from "../api/auth.js";

const AUTH_USER_ID_KEY = "nb_user_id";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Восстановление auth state
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
        if (err.status === 401 || err.status === 403 || err.status === 404) {
          localStorage.removeItem(AUTH_USER_ID_KEY);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const { userId } = await apiLogin(email, password);

    localStorage.setItem(AUTH_USER_ID_KEY, userId);

    const user = await getCurrentUser(userId);
    setCurrentUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
    } finally {
      localStorage.removeItem(AUTH_USER_ID_KEY);
      setCurrentUser(null);
    }
  }, []);

  const updateUser = useCallback((user) => setCurrentUser(user), []);

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: currentUser !== null,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
