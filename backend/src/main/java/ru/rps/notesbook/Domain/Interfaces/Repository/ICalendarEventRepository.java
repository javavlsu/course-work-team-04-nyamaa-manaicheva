package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.CalendarEvent;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ICalendarEventRepository {

    List<CalendarEvent> GetEventsByCalendarId(UUID calendarId);
    List<CalendarEvent> GetEventsByCalendarIdAndRange(UUID calendarId, LocalDateTime from, LocalDateTime to);
    List<CalendarEvent> GetEventsByNoteId(UUID noteId);
    Optional<CalendarEvent> GetEventById(UUID id);
    CalendarEvent SaveEvent(CalendarEvent event);
    void DeleteEventById(UUID id);
    void DeleteEventsByCalendarId(UUID calendarId);

}
