import { useState } from "react";

import { BackIcon, CalendarIcon, UserIcon } from "./icons";

export default function AccountSection({ profile, onSave, onBack }) {
  const [first, setFirst] = useState(profile.first);
  const [last, setLast] = useState(profile.last);
  const [email, setEmail] = useState("a.volkov@company.ru");
  const [birthday, setBirthday] = useState("1990-06-15");
  const [password, setPassword] = useState("password123");
  const [password2, setPassword2] = useState("password123");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(first.trim(), last.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleLogout = () => {
    if (window.confirm("Вы уверены, что хотите выйти из аккаунта?")) {
      console.log("Logout");
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Вы уверены, что хотите удалить аккаунт? Это действие необратимо.",
      )
    ) {
      console.log("Delete account");
    }
  };

  return (
    <div className="account-section visible">
      <a className="account-back" onClick={onBack}>
        <BackIcon />
        Назад к настройкам
      </a>
      <div className="account-title">Аккаунт</div>
      <div className="account-meta">
        <div className="account-badge">
          <CalendarIcon />
          Дата регистрации: <strong>12 марта 2025</strong>
        </div>
        <div className="account-badge">
          <UserIcon />
          Роль: <strong>Премиум-подписка</strong>
        </div>
      </div>
      <div className="account-form">
        <div className="form-row">
          <div className="field">
            <label>Имя</label>
            <input
              className="input"
              type="text"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Фамилия</label>
            <input
              className="input"
              type="text"
              value={last}
              onChange={(e) => setLast(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Дата рождения</label>
          <input
            className="input"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
          />
        </div>
        <div className="form-row">
          <div className="field">
            <label>Пароль</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Подтверждение пароля</label>
            <input
              className="input"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </div>
        </div>
        <div className="account-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? "Сохранено ✓" : "Сохранить изменения"}
          </button>
        </div>
      </div>
      <div className="account-bottom-actions">
        <button className="btn btn-logout" onClick={handleLogout}>
          Выйти
        </button>
        <button className="btn btn-danger" onClick={handleDelete}>
          Удалить аккаунт
        </button>
      </div>
    </div>
  );
}
