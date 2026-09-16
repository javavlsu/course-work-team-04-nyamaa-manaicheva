import { useLayoutEffect } from "react";
import { useOutletContext } from "react-router-dom";

import { useAnalytics } from "./hooks/useAnalytics";
import Topbar from "./components/Topbar";
import StatCards from "./components/StatCards";
import ChartPanel from "./components/ChartPanel";
import WeeklyBars from "./components/WeeklyBars";
import DirectoryBars from "./components/DirectoryBars";
import CalendarInsights from "./components/CalendarInsights";
import ProgressDonut from "./components/ProgressDonut";
import "./AnalyticsPage.css";

export function AnalyticsPage() {
  const { setSidebarProps } = useOutletContext();
  const { data, progress, donut, isLoading, error, reload } = useAnalytics();

  useLayoutEffect(() => {
    setSidebarProps({ active: "analytics" });
  }, [setSidebarProps]);

  return (
    <>
      <Topbar />
      {isLoading && (
        <div className="notes-loading">
          <div className="notes-loading-spinner" />
          <span>Загрузка аналитики…</span>
        </div>
      )}

      {!isLoading && error && !data && (
        <div className="notes-error">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={reload}>
            Попробовать снова
          </button>
        </div>
      )}

      {!isLoading && data && (
        <div className="analytics-content">
          <StatCards stats={data.stats} />

          <div className="chart-grid charts-grow">
            <ChartPanel title="Хронология создания заметок">
              <div className="chart-canvas grow">
                <WeeklyBars data={data.weeklyNotes} />
              </div>
            </ChartPanel>
            <ChartPanel title="Распределение заметок по директориям">
              <div className="chart-canvas grow">
                <DirectoryBars data={data.directoryNotes} />
              </div>
            </ChartPanel>
          </div>

          <div className="chart-grid stats-grid">
            <ChartPanel title="Календарь">
              <CalendarInsights metrics={data.calendarMetrics} />
            </ChartPanel>
            <ChartPanel title="Планирование (канбан)" className="kanban-panel">
              <ProgressDonut progress={progress} data={donut} />
            </ChartPanel>
          </div>
        </div>
      )}
    </>
  );
}