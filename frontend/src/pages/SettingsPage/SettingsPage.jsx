import { useEffect, useState } from "react";

import AppSidebar from "../../components/layout/AppSidebar";
import { mockNotes } from "../../lib/utils/mockData";
import SettingsToggle from "./SettingsToggle";
import ProfileCard from "./ProfileCard";
import AccountSection from "./AccountSection";
import { DownloadIcon, SyncIcon } from "./icons";
import "./SettingsPage.css";

export function SettingsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [modules, setModules] = useState({
    kanban: true,
    calendar: true,
    analytics: true,
  });
  const [dark, setDark] = useState(
    () => localStorage.getItem("nb-theme") === "dark",
  );
  const [profile, setProfile] = useState({ first: "Алексей", last: "Волков" });
  const [editing, setEditing] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("nb-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("nb-theme", "light");
    }
  }, [dark]);

  const toggleModule = (key) =>
    setModules((m) => ({ ...m, [key]: !m[key] }));

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(mockNotes, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notesbook-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSync = () => {
    console.log("Sync with cloud");
  };

  const handleDeleteAll = () => {
    if (
      window.confirm(
        "Вы уверены, что хотите безвозвратно удалить все данные?",
      )
    ) {
      console.log("Delete all data");
    }
  };

  const initials = (profile.first[0] || "") + (profile.last[0] || "");

  return (
    <div className="app">
      <AppSidebar
        active="settings"
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        modules={modules}
      />
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Настройки</span>
          </div>
        </div>
        <div className="settings-content">
          {editing ? (
            <AccountSection
              profile={profile}
              onSave={(first, last) => setProfile({ first, last })}
              onBack={() => setEditing(false)}
            />
          ) : (
            <>
              <ProfileCard
                initials={initials}
                name={`${profile.first} ${profile.last}`}
                role="Премиум-подписка"
                onEdit={() => setEditing(true)}
              />

              <section className="settings-section">
                <h2 className="settings-section-title">Модули</h2>
                <p className="settings-section-desc">
                  Управляйте доступностью модулей в боковой панели. Изменения
                  применяются сразу.
                </p>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-row-info">
                      <div className="settings-row-label">Канбан-доска</div>
                      <div className="settings-row-desc">
                        Управление задачами через колонки статусов с
                        drag-and-drop
                      </div>
                    </div>
                    <SettingsToggle
                      checked={modules.kanban}
                      onChange={() => toggleModule("kanban")}
                    />
                  </div>
                  <div className="settings-row">
                    <div className="settings-row-info">
                      <div className="settings-row-label">Календарь</div>
                      <div className="settings-row-desc">
                        Просмотр событий и дедлайнов по датам: в вашем
                        расписании
                      </div>
                    </div>
                    <SettingsToggle
                      checked={modules.calendar}
                      onChange={() => toggleModule("calendar")}
                    />
                  </div>
                  <div className="settings-row">
                    <div className="settings-row-info">
                      <div className="settings-row-label">Аналитика</div>
                      <div className="settings-row-desc">
                        Глубокая статистика по вашей активности
                      </div>
                    </div>
                    <SettingsToggle
                      checked={modules.analytics}
                      onChange={() => toggleModule("analytics")}
                    />
                  </div>
                </div>
              </section>

              <section className="settings-section">
                <h2 className="settings-section-title">Внешний вид</h2>
                <p className="settings-section-desc">
                  Настройте тему оформления под себя.
                </p>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-row-info">
                      <div className="settings-row-label">Тёмная тема</div>
                      <div className="settings-row-desc">
                        Переключатель между светлой и тёмной темой оформления
                      </div>
                    </div>
                    <SettingsToggle
                      checked={dark}
                      onChange={() => setDark(!dark)}
                    />
                  </div>
                </div>
              </section>

              <section className="settings-section">
                <h2 className="settings-section-title">Данные</h2>
                <p className="settings-section-desc">
                  Управляйте резервными копиями и экспортом данных.
                </p>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-row-info">
                      <div className="settings-row-label">
                        Локальная копия: Экспорт
                      </div>
                      <div className="settings-row-desc">
                        Скачивание всех ваших заметок в формате JSON
                      </div>
                    </div>
                    <button className="btn btn-secondary" onClick={handleExport}>
                      <DownloadIcon />
                      Скачать
                    </button>
                  </div>
                  <div className="settings-row">
                    <div className="settings-row-info">
                      <div className="settings-row-label">
                        Облачная синхронизация
                      </div>
                      <div className="settings-row-desc">
                        Синхронизация ваших данных с облаком
                      </div>
                    </div>
                    <button className="btn btn-secondary" onClick={handleSync}>
                      <SyncIcon />
                      Синхронизировать
                    </button>
                  </div>
                  <div className="settings-row">
                    <div className="settings-row-info">
                      <div className="settings-row-label">
                        Удалить все данные
                      </div>
                      <div className="settings-row-desc">
                        Безвозвратное удаление всех ваших заметок и настроек
                      </div>
                    </div>
                    <button className="btn btn-danger" onClick={handleDeleteAll}>
                      Удалить
                    </button>
                  </div>
                </div>
              </section>

              <section className="settings-section">
                <h2 className="settings-section-title">Уведомления</h2>
                <p className="settings-section-desc">
                  Настройте способ получения уведомлений.
                </p>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-row-info">
                      <div className="settings-row-label">
                        Email-уведомления:
                      </div>
                      <div className="settings-row-desc">
                        Получать письма о важных событиях
                      </div>
                    </div>
                    <SettingsToggle
                      checked={emailNotif}
                      onChange={() => setEmailNotif(!emailNotif)}
                    />
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
