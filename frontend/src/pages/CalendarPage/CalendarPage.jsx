import { useState } from "react";

import AppSidebar from "../../components/layout/AppSidebar";
import Topbar from "./Topbar";
import CalendarGrid from "./CalendarGrid";
import DayDetailModal from "./DayDetailModal";
import "./CalendarPage.css";

export function CalendarPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  return (
    <>
      <div className="app">
        <AppSidebar
          active="calendar"
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <div className="main">
          <Topbar />
          <div className="calendar-container">
            <CalendarGrid onSelectDay={setSelectedDay} />
          </div>
        </div>
      </div>
      {selectedDay !== null && (
        <DayDetailModal day={selectedDay} onClose={() => setSelectedDay(null)} />
      )}
    </>
  );
}
