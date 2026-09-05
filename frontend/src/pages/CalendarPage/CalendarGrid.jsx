import { calendarEvents } from "../../lib/utils/mockData";

const DAY_HEADERS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function buildCells() {
  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(2026, 7, i - 4);
    cells.push({ day: date.getDate(), otherMonth: date.getMonth() !== 7 });
  }
  return cells;
}

const CELLS = buildCells();

function CalendarGrid({ onSelectDay }) {
  return (
    <div className="calendar-grid">
      {DAY_HEADERS.map((header) => (
        <div key={header} className="calendar-day-header">{header}</div>
      ))}
      {CELLS.map((cell, index) => {
        const clickable = !cell.otherMonth;
        let className = "calendar-day";
        if (cell.otherMonth) className += " other-month";
        else if (cell.day === 14) className += " today";
        const events = clickable ? calendarEvents[cell.day] : undefined;
        return (
          <div
            key={`${cell.day}-${index}`}
            className={className}
            onClick={clickable ? () => onSelectDay(cell.day) : undefined}
          >
            <span className="day-number">{cell.day}</span>
            {events && (
              <div className="day-events">
                {events.map((event) => (
                  <span key={event.label} className={`day-event ${event.type}`}>
                    {event.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default CalendarGrid;
