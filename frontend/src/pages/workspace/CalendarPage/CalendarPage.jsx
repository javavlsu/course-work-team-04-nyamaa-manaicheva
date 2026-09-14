import { useLayoutEffect } from "react";
import { useOutletContext } from "react-router-dom";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";

import DayDetailModal from "./components/DayDetailModal";
import { useCalendar } from "./hooks/useCalendar";
import "./CalendarPage.css";

export function CalendarPage() {
  const { setSidebarProps } = useOutletContext();
  const {
    events,
    selectedDate,
    isLoading,
    error,
    hasCalendar,
    openDay,
    closeDay,
    getDayEvents,
    loadRange,
    reload,
    addEvent,
  } = useCalendar();

  useLayoutEffect(() => {
    setSidebarProps({ active: "calendar" });
  }, [setSidebarProps]);

  if (!hasCalendar && isLoading) {
    return (
      <div className="calendar-container">
        <div className="notes-loading">
          <div className="notes-loading-spinner" />
          <span>Загрузка календаря…</span>
        </div>
      </div>
    );
  }

  if (!hasCalendar && error) {
    return (
      <div className="calendar-container">
        <div className="notes-error">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={reload}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="calendar-container">
        {error && (
          <div className="calendar-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={reload}>
              Повторить
            </button>
          </div>
        )}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          locale={ruLocale}
          initialView="dayGridMonth"
          headerToolbar={{ left: "prev,next title", right: "today" }}
          height="auto"
          fixedWeekCount
          events={events}
          datesSet={({ startStr, endStr }) => loadRange(startStr, endStr)}
          dateClick={({ dateStr }) => openDay(dateStr)}
          eventClick={({ event }) => openDay(event.startStr)}
        />
      </div>
      {selectedDate && (
        <DayDetailModal
          date={new Date(`${selectedDate}T00:00:00`)}
          dateStr={selectedDate}
          events={getDayEvents(selectedDate)}
          onClose={closeDay}
          onAddEvent={addEvent}
        />
      )}
    </>
  );
}