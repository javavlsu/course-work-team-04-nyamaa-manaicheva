import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { RefreshCw } from "lucide-react";

import * as adminApi from "@/api/admin.js";
import "../../workspace/TrashPage/TrashPage.css";
import "./LogsPage.css";

const LOG_LINES = 500;

export function LogsPage() {
  const { setSidebarProps } = useOutletContext();

  const [logs, setLogs] = useState({ available: true, content: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    setSidebarProps({ active: "logs" });
  }, [setSidebarProps]);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getLogs(LOG_LINES);
      setLogs({ available: Boolean(data?.available), content: data?.content ?? "" });
    } catch (err) {
      setError(err.message || "Не удалось загрузить логи");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">Логи</span>
        </div>
        <div className="topbar-right">
          <button type="button" className="trash-action-btn" onClick={fetchLogs} disabled={isLoading}>
            <RefreshCw size={15} strokeWidth={1.8} />
            <span>Обновить</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="notes-error">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchLogs}>
            Попробовать снова
          </button>
        </div>
      )}

      {!error && (
        <div className="logs-area">
          {!isLoading && !logs.available ? (
            <div className="empty-state">
              <p>Лог-файл ещё не создан.</p>
            </div>
          ) : (
            <textarea
              className="logs-textarea"
              readOnly
              spellCheck={false}
              value={isLoading ? "Загрузка логов…" : logs.content}
              aria-label="Логи приложения"
            />
          )}
        </div>
      )}
    </>
  );
}
