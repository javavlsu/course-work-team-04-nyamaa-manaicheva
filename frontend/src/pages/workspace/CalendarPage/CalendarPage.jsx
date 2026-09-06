import { useState } from "react";
import { useOutletContext } from "react-router-dom";

import AppSidebar from "../../../components/layout/AppSidebar";
import Topbar from "./Topbar";
import CalendarGrid from "./CalendarGrid";
import DayDetailModal from "./DayDetailModal";
import "./CalendarPage.css";

export function CalendarPage() {
  const { collapsed, onToggleSidebar } = useOutletContext();
  const [selectedDay, setSelectedDay] = useState(null);

  return (
    <>
      <AppSidebar
        active="calendar"
        collapsed={collapsed}
        onToggle={onToggleSidebar}
      />
      <div className="main">
        <Topbar />
        <div className="calendar-container">
          <CalendarGrid onSelectDay={setSelectedDay} />
        </div>
      </div>
      {selectedDay !== null && (
        <DayDetailModal day={selectedDay} onClose={() => setSelectedDay(null)} />
      )}
    </>
  );
}