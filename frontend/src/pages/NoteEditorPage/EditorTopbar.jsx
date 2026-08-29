import { useState } from "react";
import { Link, Lock, Plus, Trash, Upload } from "lucide-react";

import { privacyOptions } from "../../lib/utils/mockData";
import {
  EyeIcon,
  GlobeIcon,
  PenIcon,
  SaveIcon,
  ShieldIcon,
  StarIcon,
  UsersIcon,
} from "./icons";

const privacyIcons = {
  private: Lock,
  link: Link,
  team: UsersIcon,
  public: GlobeIcon,
};

function PrivacyMenu({
  open,
  onToggle,
  privacy,
  onSelect,
  wrapRef,
  users,
  onAdd,
  onRemove,
}) {
  const [draft, setDraft] = useState("");

  const handleAdd = () => {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft("");
  };

  return (
    <div className="privacy-wrap" ref={wrapRef}>
      <button
        className="btn btn-ghost"
        title="Настройки приватности"
        onClick={onToggle}
      >
        <ShieldIcon />
      </button>
      <div className={open ? "privacy-dropdown open" : "privacy-dropdown"}>
        <h4>
          <ShieldIcon />
          Приватность и доступ
        </h4>
        <div className="privacy-options">
          {privacyOptions.map((opt) => {
            const Icon = privacyIcons[opt.key];
            return (
              <div
                key={opt.key}
                className={privacy === opt.key ? "privacy-opt active" : "privacy-opt"}
                data-privacy={opt.key}
                onClick={() => onSelect(opt.key)}
              >
                <Icon strokeWidth={1.8} />
                <span className="opt-label">
                  {opt.label} <span className="opt-desc">{opt.desc}</span>
                </span>
              </div>
            );
          })}
        </div>
        <div className="dropdown-divider"></div>
        <div className="dropdown-share-row">
          <input
            type="text"
            placeholder="Email или имя…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            className="btn btn-primary"
            style={{ padding: "8px 12px", fontSize: "13px" }}
            onClick={handleAdd}
          >
            <Plus />
          </button>
        </div>
        <div className="dropdown-share-list">
          {users.map((user, i) => (
            <div className="dropdown-share-item" key={`${user.name}-${i}`}>
              <div className="user-avatar">{user.initials}</div>
              <span>{user.name}</span>
              <span className="share-role">{user.role}</span>
              <span className="remove-user" onClick={() => onRemove(i)}>
                ×
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EditorTopbar({
  mode,
  onModeChange,
  favorited,
  onToggleFavorite,
  privacyOpen,
  onTogglePrivacy,
  privacy,
  onSelectPrivacy,
  privacyWrapRef,
  shareUsers,
  onAddShareUser,
  onRemoveShareUser,
  onExport,
  onSave,
}) {
  return (
    <div className="editor-topbar">
      <div className="editor-topbar-left">
        <div className="mode-toggle">
          <button
            className={mode === "edit" ? "active" : ""}
            title="Режим редактирования"
            onClick={() => onModeChange("edit")}
          >
            <PenIcon />
          </button>
          <button
            className={mode === "preview" ? "active" : ""}
            title="Режим просмотра"
            onClick={() => onModeChange("preview")}
          >
            <EyeIcon />
          </button>
        </div>
        <button
          className="btn btn-ghost"
          title="Добавить в избранное"
          onClick={onToggleFavorite}
        >
          <StarIcon filled={favorited} />
        </button>
        <PrivacyMenu
          open={privacyOpen}
          onToggle={onTogglePrivacy}
          privacy={privacy}
          onSelect={onSelectPrivacy}
          wrapRef={privacyWrapRef}
          users={shareUsers}
          onAdd={onAddShareUser}
          onRemove={onRemoveShareUser}
        />
        <button className="btn btn-danger" title="Удалить заметку">
          <Trash strokeWidth={1.6} />
        </button>
      </div>
      <div className="editor-topbar-right">
        <button
          className="btn btn-secondary"
          title="Экспорт заметки"
          style={{
            padding: "8px 12px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onClick={onExport}
        >
          <Upload strokeWidth={1.6} />
          Экспорт
        </button>
        <button className="btn btn-primary" onClick={onSave}>
          <SaveIcon />
          Сохранить
        </button>
      </div>
    </div>
  );
}
