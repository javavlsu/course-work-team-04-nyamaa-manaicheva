import { useLayoutEffect } from "react";
import { useOutletContext } from "react-router-dom";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";

import DayDetailModal from "./components/DayDetailModal";
import { useCalendar } from "./hooks/useCalendar";
import "./CalendarPage.css";

function eventClassNames({ event }) {
  return `fc-event-${event.extendedProps.category}`;
}

export function CalendarPage() {
  const { setSidebarProps } = useOutletContext();
  const { events, selectedDate, openDay, closeDay, getDayEvents } = useCalendar();

  useLayoutEffect(() => {
    setSidebarProps({ active: "calendar" });
  }, [setSidebarProps]);

  return (
    <>
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