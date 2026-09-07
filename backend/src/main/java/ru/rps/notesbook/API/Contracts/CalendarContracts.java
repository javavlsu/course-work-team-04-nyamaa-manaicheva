package ru.rps.notesbook.API.Contracts;

import java.time.LocalDateTime;
import java.util.UUID;

public final class CalendarContracts {

    public record CalendarResponse(
            UUID id,
            UUID ownerId,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    public record CalendarEventResponse(
            UUID id,
            UUID calendarId,
            String title,
            String description,
            LocalDateTime startAt,
            LocalDateTime endAt,
            boolean allDay,
            UUID noteId,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    public record CreateEventRequest(
            String title,
            String description,
            LocalDateTime startAt,
            LocalDateTime endAt,
            Boolean allDay,
            UUID noteId
    ) {}

    public record UpdateEventRequest(
            String title,
            String description,
            LocalDateTime startAt,
            LocalDateTime endAt,
            Boolean allDay
    ) {}

}
