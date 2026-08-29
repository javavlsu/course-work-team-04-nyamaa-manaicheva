import { useState } from "react";

import AppSidebar from "../../components/layout/AppSidebar";
import Topbar from "./Topbar";
import StatCards from "./StatCards";
import ChartPanel from "./ChartPanel";
import WeeklyBars from "./WeeklyBars";
import DirectoryBars from "./DirectoryBars";
import ProgressDonut from "./ProgressDonut";
import ActivityList from "./ActivityList";
import "./AnalyticsPage.css";

export function AnalyticsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [period, setPeriod] = useState("Месяц");

  return (
    <div className="app">
      <AppSidebar
        active="analytics"
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className="main">
        <Topbar period={period} onPeriodChange={setPeriod} />
        <div className="analytics-content">
          <StatCards />
          <div className="chart-grid">
            <ChartPanel title="Создано заметок по неделям">
              <div className="chart-canvas">
                <WeeklyBars />
              </div>
            </ChartPanel>
            <ChartPanel title="Прогресс выполнения">
              <ProgressDonut />
            </ChartPanel>
          </div>
          <ChartPanel
            title="Заметки по директориям"
            style={{ marginBottom: "32px" }}
          >
            <div className="chart-canvas">
              <DirectoryBars />
            </div>
          </ChartPanel>
          <ChartPanel title="Последняя активность">
            <ActivityList />
          </ChartPanel>
        </div>
      </div>
    </div>
  );
}
