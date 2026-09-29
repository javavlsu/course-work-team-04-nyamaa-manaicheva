import { api } from "./client.js";

export async function login(email, password) {
  return api.post("/api/auth/login", { email, password });
}

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

export async function logout() {
  return api.post("/logout", undefined);
}

export async function getCurrentUser(userId) {
  return api.get(`/api/users/${userId}`);
}

export async function forgotPassword(email) {
  return api.post("/api/auth/forgot-password", { email });
}

export async function resetPassword({ token, newPassword, newPasswordConfirm }) {
  return api.post("/api/auth/reset-password", { token, newPassword, newPasswordConfirm });
}
