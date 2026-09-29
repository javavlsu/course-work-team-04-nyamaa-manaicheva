export const ROLE_ADMIN = "Admin";
export const ROLE_CLIENT = "Client";

export function isAdmin(user) {
  return user?.role === ROLE_ADMIN;
}

export function homePathFor(user) {
  return isAdmin(user) ? "/admin/users" : "/notes";
}

export function canVisitPath(user, path) {
  if (!path) return false;
  const isAdminPath = path === "/admin" || path.startsWith("/admin/");
  return isAdmin(user) ? isAdminPath : !isAdminPath;
}
