import { X } from "lucide-react";

const DAY_TITLE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

function DayDetailModal({ date, events, onClose }) {
  return (
    <>
      <div className="day-detail-overlay open" onClick={onClose}></div>
      <div className="day-detail open">
        <div className="day-detail-header">
          <span className="day-detail-title">{DAY_TITLE_FORMATTER.format(date)}</span>
          <button className="day-detail-close" onClick={onClose}>
            <X strokeWidth={1.6} />
          </button>
        </div>
        <div className="day-detail-events">
          {events.length === 0 ? (
            <p className="day-detail-empty">Нет событий на этот день</p>
          ) : (
            events.map((event) => (
              <div key={event.title} className="day-detail-event">
                <span className="event-dot" style={{ background: event.color }}></span>
                <div className="event-info">
                  <div className="event-title">{event.title}</div>
                  <div className="event-time">{event.cat}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default DayDetailModal;