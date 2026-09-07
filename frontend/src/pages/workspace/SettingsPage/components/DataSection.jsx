import { Download, RefreshCw } from "lucide-react";

function formatDateTime(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function DataSection({ sync, exportData }) {
  return (
    <section className="settings-section">
      <h2 className="settings-section-title">Данные</h2>
      <p className="settings-section-desc">
        Управляйте резервными копиями и экспортом данных.
      </p>
      <div className="settings-card">
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Локальная копия: Экспорт</div>
            <div className="settings-row-desc">
              Скачивание всех ваших заметок в формате JSON
            </div>
            {exportData.error && (
              <div className="settings-feedback settings-feedback-error">
                {exportData.error}
              </div>
            )}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={exportData.exportAll}
            disabled={exportData.isExporting}
          >
            <Download strokeWidth={1.6} aria-hidden="true" />
            {exportData.isExporting ? "Загрузка…" : "Скачать"}
          </button>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Облачная синхронизация</div>
            <div className="settings-row-desc">
              {sync.lastSyncAt
                ? `Последняя синхронизация: ${formatDateTime(sync.lastSyncAt)}`
                : "Синхронизация ваших данных с облаком"}
            </div>
            {sync.error && (
              <div className="settings-feedback settings-feedback-error">
                {sync.error}
              </div>
            )}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={sync.sync}
            disabled={sync.isSyncing}
          >
            <RefreshCw strokeWidth={1.6} aria-hidden="true" />
            {sync.isSyncing ? "Синхронизация…" : "Синхронизировать"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default DataSection;