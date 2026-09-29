import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Users } from "lucide-react";

import * as adminApi from "@/api/admin.js";
import { useAuth } from "@/context/AuthContext.jsx";
import UserRow from "./UserRow";
import UserFormModal from "./UserFormModal";
import DeleteUserModal from "./DeleteUserModal";
import "../../workspace/TrashPage/TrashPage.css";
import "./UsersPage.css";

function pluralRuUsers(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "пользователь";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "пользователя";
  return "пользователей";
}

function sortUsers(users) {
  return [...users].sort((a, b) =>
    `${a.surname ?? ""} ${a.name ?? ""}`.localeCompare(`${b.surname ?? ""} ${b.name ?? ""}`, "ru"),
  );
}

export function UsersPage() {
  const { setSidebarProps } = useOutletContext();
  const { currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useLayoutEffect(() => {
    setSidebarProps({ active: "users" });
  }, [setSidebarProps]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setUsers(sortUsers(await adminApi.listAllUsers()));
    } catch (err) {
      setError(err.message || "Не удалось загрузить пользователей");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (data) => {
    const created = await adminApi.createUser(data);
    setUsers((prev) => sortUsers([...prev, created]));
    setCreating(false);
  };

  const handleEdit = async (data) => {
    const target = editingUser;
    const { role, ...profile } = data;

    let updated = await adminApi.updateUser(target.id, profile);
    if (role !== target.role) {
      updated = await adminApi.changeRole(target.id, role);
    }

    setUsers((prev) => sortUsers(prev.map((u) => (u.id === target.id ? updated : u))));
    setEditingUser(null);
  };

  const handleDeleteConfirm = async () => {
    const target = deletingUser;
    if (!target || isDeleting) return;

    setIsDeleting(true);
    setDeleteError("");
    try {
      await adminApi.deleteUser(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      setDeletingUser(null);
    } catch (err) {
      setDeleteError(err.message || "Не удалось удалить пользователя");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">Пользователи</span>
          {!isLoading && !error && (
            <span className="topbar-count">
              {users.length} {pluralRuUsers(users.length)}
            </span>
          )}
        </div>
        <div className="topbar-right"></div>
      </div>

      {isLoading && (
        <div className="notes-loading">
          <div className="notes-loading-spinner" />
          <span>Загрузка пользователей…</span>
        </div>
      )}

      {!isLoading && error && (
        <div className="notes-error">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchUsers}>
            Попробовать снова
          </button>
        </div>
      )}

      {!isLoading && !error && (
        users.length > 0 ? (
          <div className="trash-list">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isSelf={user.id === currentUser?.id}
                disabled={isDeleting}
                onEdit={() => setEditingUser(user)}
                onDeleteRequest={() => {
                  setDeleteError("");
                  setDeletingUser(user);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Users strokeWidth={1.4} aria-hidden="true" />
            <p>Пользователей пока нет.</p>
          </div>
        )
      )}

      <button
        type="button"
        className="admin-fab"
        title="Добавить пользователя"
        aria-label="Добавить пользователя"
        onClick={() => setCreating(true)}
      >
        <Plus strokeWidth={2} aria-hidden="true" />
      </button>

      {creating && (
        <UserFormModal mode="create" onClose={() => setCreating(false)} onSubmit={handleCreate} />
      )}

      {editingUser && (
        <UserFormModal
          mode="edit"
          user={editingUser}
          isSelf={editingUser.id === currentUser?.id}
          onClose={() => setEditingUser(null)}
          onSubmit={handleEdit}
        />
      )}

      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          isDeleting={isDeleting}
          error={deleteError}
          onClose={() => {
            if (!isDeleting) setDeletingUser(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}
