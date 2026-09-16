import SettingsToggle from "./SettingsToggle";

const MODULES = [
  {
    key: "kanban",
    label: "Канбан-доска",
    description:
      "Управление задачами через колонки статусов с drag-and-drop",
  },
  {
    key: "calendar",
    label: "Календарь",
    description: "Просмотр событий и дедлайнов по датам: в вашем расписании",
  },
  {
    key: "analytics",
    label: "Аналитика",
    description: "Глубокая статистика по вашей активности",
  },
];

function ModulesSection({ modules, onToggle }) {
  return (
    <section className="settings-section">
      <h2 className="settings-section-title">Модули</h2>
      <p className="settings-section-desc">
        Управляйте доступностью модулей в боковой панели. Изменения применяются
        сразу.
      </p>
      <div className="settings-card">
        {MODULES.map((module) => (
          <div className="settings-row" key={module.key}>
            <div className="settings-row-info">
              <div className="settings-row-label">{module.label}</div>
              <div className="settings-row-desc">{module.description}</div>
            </div>
            <SettingsToggle
              checked={modules[module.key]}
              onChange={() => onToggle(module.key)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default ModulesSection;