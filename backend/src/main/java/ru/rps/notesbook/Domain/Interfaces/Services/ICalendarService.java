package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.CalendarContracts;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ICalendarService {

    CalendarContracts.CalendarResponse GetOrCreateCalendarForUser(UUID ownerId);

    CalendarContracts.CalendarEventResponse CreateEvent(UUID currentUserId, UUID calendarId, CalendarContracts.CreateEventRequest request);

    CalendarContracts.CalendarEventResponse GetEventById(UUID currentUserId, UUID eventId);

    List<CalendarContracts.CalendarEventResponse> GetEventsByRange(UUID currentUserId, UUID calendarId, LocalDateTime from, LocalDateTime to);

    CalendarContracts.CalendarEventResponse UpdateEvent(UUID currentUserId, UUID eventId, CalendarContracts.UpdateEventRequest request);

    void DeleteEvent(UUID currentUserId, UUID eventId);

    CalendarContracts.CalendarEventResponse LinkNoteToEvent(UUID currentUserId, UUID eventId, UUID noteId);

    CalendarContracts.CalendarEventResponse UnlinkNoteFromEvent(UUID currentUserId, UUID eventId);

}
