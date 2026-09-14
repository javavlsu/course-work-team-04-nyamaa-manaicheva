import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";

import DayDetailModal from "./components/DayDetailModal";
import { useCalendar } from "./hooks/useCalendar";
import "./CalendarPage.css";

function formatMonthLabel(date) {
  const month = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(date);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}

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

  const calendarRef = useRef(null);
  const [monthLabel, setMonthLabel] = useState(() => formatMonthLabel(new Date()));

  useLayoutEffect(() => {
    setSidebarProps({ active: "calendar" });
  }, [setSidebarProps]);

  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();

  const handleDatesSet = (arg) => {
    setMonthLabel(formatMonthLabel(arg.view.calendar.getDate()));
    loadRange(arg.startStr, arg.endStr);
  };

  const calendarEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        classNames: event.noteId ? "fc-event--note" : "fc-event--event",
      })),
    [events],
  );

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <button className="back-button" type="button" onClick={handlePrev} aria-label="Предыдущий месяц">
            <ChevronLeft size={20} strokeWidth={1.8} />
          </button>
          <button className="back-button" type="button" onClick={handleNext} aria-label="Следующий месяц">
            <ChevronRight size={20} strokeWidth={1.8} />
          </button>
          <span className="topbar-title">{monthLabel}</span>
        </div>
        <div className="topbar-right"></div>
      </div>
      <div className="calendar-container">
        {!hasCalendar && isLoading && (
          <div className="notes-loading">
            <div className="notes-loading-spinner" />
            <span>Загрузка календаря…</span>
          </div>
        )}
        {!hasCalendar && !isLoading && error && (
          <div className="notes-error">
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={reload}>
              Попробовать снова
            </button>
          </div>
        )}
        {hasCalendar && (
          <>
            {error && (
              <div className="calendar-error" role="alert">
                <span>{error}</span>
                <button type="button" onClick={reload}>
                  Повторить
                </button>
              </div>
            )}
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              locale={ruLocale}
              initialView="dayGridMonth"
              headerToolbar={false}
              height="100%"
              fixedWeekCount
              events={calendarEvents}
              datesSet={handleDatesSet}
              dateClick={({ dateStr }) => openDay(dateStr)}
              eventClick={({ event }) => openDay(event.startStr)}
            />
          </>
        )}
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
