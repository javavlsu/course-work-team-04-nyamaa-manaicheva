import { useOutletContext } from "react-router-dom";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";

import AppSidebar from "../../../components/layout/AppSidebar";
import DayDetailModal from "./components/DayDetailModal";
import { useCalendar } from "./hooks/useCalendar";
import "./CalendarPage.css";

function eventClassNames({ event }) {
  return `fc-event-${event.extendedProps.category}`;
}

export function CalendarPage() {
  const { collapsed, onToggleSidebar } = useOutletContext();
  const { events, selectedDate, openDay, closeDay, getDayEvents } = useCalendar();

  return (
    <>
      <AppSidebar
        active="calendar"
        collapsed={collapsed}
        onToggle={onToggleSidebar}
      />
      <div className="main">
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            locale={ruLocale}
            initialDate="2026-08-01"
            initialView="dayGridMonth"
            headerToolbar={{ left: "prev,next title", right: "today" }}
            height="auto"
            fixedWeekCount
            events={events}
            eventClassNames={eventClassNames}
            dateClick={({ dateStr }) => openDay(dateStr)}
            eventClick={({ event }) => openDay(event.startStr)}
          />
        </div>
      </div>
      {selectedDate && (
        <DayDetailModal
          date={new Date(`${selectedDate}T00:00:00`)}
          events={getDayEvents(selectedDate)}
          onClose={closeDay}
        />
      )}
    </>
  );
}