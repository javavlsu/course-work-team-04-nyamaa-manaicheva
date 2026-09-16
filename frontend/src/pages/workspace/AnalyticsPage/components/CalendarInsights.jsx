function CalendarInsights({ metrics }) {
  return (
    <div className="calendar-metrics">
      <div className="calendar-metric">
        <span className="calendar-metric-label">Добавлено событий</span>
        <span className="calendar-metric-value">{metrics.eventsCount}</span>
      </div>
      <div className="calendar-metric">
        <span className="calendar-metric-label">Прикреплено заметок</span>
        <span className="calendar-metric-value">{metrics.attachedNotes}</span>
      </div>
    </div>
  );
}

export default CalendarInsights;