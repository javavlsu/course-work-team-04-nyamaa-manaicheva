/**
 * Роли пользователей (совпадают с RoleTypeEnum на backend).
 */
export const ROLE_ADMIN = "Admin";
export const ROLE_CLIENT = "Client";

export function isAdmin(user) {
  return user?.role === ROLE_ADMIN;
}

/**
 * Домашняя страница по роли: администратор — панель управления пользователями,
 * клиент — лента заметок.
 *
 * @param {{ role?: string }|null|undefined} user
 * @returns {string}
 */
export function homePathFor(user) {
  return isAdmin(user) ? "/admin/users" : "/notes";
}

/**
 * Можно ли вернуть пользователя на страницу `path` после входа.
 * Админ не должен попадать на клиентские страницы, клиент — на /admin/*.
 *
 * @param {{ role?: string }|null|undefined} user
 * @param {string|undefined} path
 * @returns {boolean}
 */
export function canVisitPath(user, path) {
  if (!path) return false;
  const isAdminPath = path === "/admin" || path.startsWith("/admin/");
  return isAdmin(user) ? isAdminPath : !isAdminPath;
}
