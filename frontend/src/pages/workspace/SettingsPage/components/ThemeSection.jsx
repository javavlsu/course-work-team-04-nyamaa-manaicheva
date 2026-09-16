import SettingsToggle from "./SettingsToggle";

function ThemeSection({ dark, onToggle }) {
  return (
    <section className="settings-section">
      <h2 className="settings-section-title">Внешний вид</h2>
      <p className="settings-section-desc">Настройте тему оформления под себя.</p>
      <div className="settings-card">
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Тёмная тема</div>
            <div className="settings-row-desc">
              Переключатель между светлой и тёмной темой оформления
            </div>
          </div>
          <SettingsToggle checked={dark} onChange={onToggle} />
        </div>
      </div>
    </section>
  );
}

export default ThemeSection;