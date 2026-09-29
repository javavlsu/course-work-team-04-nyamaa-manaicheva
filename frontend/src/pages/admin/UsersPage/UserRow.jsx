import { Pencil, Trash2 } from "lucide-react";

import { ROLE_ADMIN } from "@/lib/utils/roles.js";
import { roleLabel } from "@/pages/workspace/SettingsPage/components/ProfileSection";

function UserRow({ user, isSelf, disabled, onEdit, onDeleteRequest }) {
  const fullName = `${user.name ?? ""} ${user.surname ?? ""}`.trim() || user.email;

  return (
    <div className="trash-item">
      <div className="trash-item-main">
        <div className="trash-item-header">
          <span className="trash-item-title">{fullName}</span>
          {isSelf && <span className="note-card-tag">Вы</span>}
        </div>
        <span className={user.role === ROLE_ADMIN ? "user-role user-role-admin" : "user-role"}>
          {roleLabel(user.role)}
        </span>
        <span className="trash-item-meta">{user.email}</span>
      </div>
      <div className="trash-item-actions">
        <button type="button" className="trash-action-btn" disabled={disabled} onClick={onEdit}>
          <Pencil size={15} strokeWidth={1.8} />
          <span>Редактировать</span>
        </button>
        <button
          type="button"
          className="trash-action-btn trash-action-btn-danger"
          disabled={disabled || isSelf}
          title={isSelf ? "Нельзя удалить собственную учётную запись" : undefined}
          onClick={onDeleteRequest}
        >
          <Trash2 size={15} strokeWidth={1.8} />
          <span>Удалить</span>
        </button>
      </div>
    </div>
  );
}

export default UserRow;
