import { X } from "lucide-react";

import { calendarDayDetails } from "../../lib/utils/mockData";

function DayDetailModal({ day, onClose }) {
  const events = calendarDayDetails[day] || [];
  return (
    <>
      <div className="day-detail-overlay open" onClick={onClose}></div>
      <div className="day-detail open">
        <div className="day-detail-header">
          <span className="day-detail-title">{day} августа</span>
          <button className="day-detail-close" onClick={onClose}>
            <X strokeWidth={1.6} />
          </button>
        </div>
        <div className="day-detail-events">
          {events.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: "14px", padding: "12px 0" }}>
              Нет событий на этот день
            </p>
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
