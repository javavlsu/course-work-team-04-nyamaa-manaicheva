import { Download, Upload } from "lucide-react";

function DataSection({ exportData }) {
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
            <div className="settings-row-label">Локальная копия: Импорт</div>
            <div className="settings-row-desc">
              Загрузка заметок из файла JSON (скоро)
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            disabled
          >
            <Upload strokeWidth={1.6} aria-hidden="true" />
            Загрузить
          </button>
        </div>
      </div>
    </section>
  );
}

export default DataSection;