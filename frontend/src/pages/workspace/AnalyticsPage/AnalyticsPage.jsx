import { useOutletContext } from "react-router-dom";

import AppSidebar from "../../../components/layout/AppSidebar";
import { useAnalytics } from "./hooks/useAnalytics";
import Topbar from "./components/Topbar";
import StatCards from "./components/StatCards";
import ChartPanel from "./components/ChartPanel";
import WeeklyBars from "./components/WeeklyBars";
import DirectoryBars from "./components/DirectoryBars";
import ProgressDonut from "./components/ProgressDonut";
import ActivityList from "./components/ActivityList";
import "./AnalyticsPage.css";

export function AnalyticsPage() {
  const { collapsed, onToggleSidebar } = useOutletContext();
  const {
    period,
    onPeriodChange,
    stats,
    weeklyNotes,
    directoryNotes,
    progress,
    donut,
    activity,
  } = useAnalytics();

  return (
    <>
      <AppSidebar
        active="analytics"
        collapsed={collapsed}
        onToggle={onToggleSidebar}
      />
      <div className="main">
        <Topbar period={period} onPeriodChange={onPeriodChange} />
        <div className="analytics-content">
          <StatCards stats={stats} />
          <div className="chart-grid">
            <ChartPanel title="Создано заметок по неделям">
              <div className="chart-canvas">
                <WeeklyBars data={weeklyNotes} />
              </div>
            </ChartPanel>
            <ChartPanel title="Прогресс выполнения">
              <ProgressDonut progress={progress} data={donut} />
            </ChartPanel>
          </div>
          <ChartPanel
            title="Заметки по директориям"
            style={{ marginBottom: "32px" }}
          >
            <div className="chart-canvas">
              <DirectoryBars data={directoryNotes} />
            </div>
          </ChartPanel>
          <ChartPanel title="Последняя активность">
            <ActivityList activity={activity} />
          </ChartPanel>
        </div>
      </div>
    </>
  );
}