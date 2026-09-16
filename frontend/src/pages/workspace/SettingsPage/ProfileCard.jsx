export default function ProfileCard({ initials, name, role, onEdit }) {
  return (
    <div className="profile-card">
      <div className="profile-avatar">{initials}</div>
      <div className="profile-info">
        <div className="profile-name">{name}</div>
        <span className="profile-role">{role}</span>
      </div>
      <button className="btn btn-secondary" onClick={onEdit}>
        Редактировать профиль
      </button>
    </div>
  );
}
