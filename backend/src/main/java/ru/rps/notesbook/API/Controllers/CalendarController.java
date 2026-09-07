package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.CalendarContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.ICalendarService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final ICalendarService calendarService;

    // Calendar

    @GetMapping
    public CalendarContracts.CalendarResponse getMyCalendar(
            @AuthenticationPrincipal NotesbookUserPrincipal principal
    ) {
        UUID userId = requireUserId(principal);
        return calendarService.GetOrCreateCalendarForUser(userId);
    }

    // Events

    @PostMapping("/{calendarId}/events")
    public CalendarContracts.CalendarEventResponse createEvent(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID calendarId,
            @RequestBody CalendarContracts.CreateEventRequest request
    ) {
        UUID userId = requireUserId(principal);
        return calendarService.CreateEvent(userId, calendarId, request);
    }

    @GetMapping("/{calendarId}/events")
    public List<CalendarContracts.CalendarEventResponse> getEventsByRange(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID calendarId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        UUID userId = requireUserId(principal);
        return calendarService.GetEventsByRange(userId, calendarId, from, to);
    }

    @GetMapping("/events/{eventId}")
    public CalendarContracts.CalendarEventResponse getEventById(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID eventId
    ) {
        UUID userId = requireUserId(principal);
        return calendarService.GetEventById(userId, eventId);
    }

    @PutMapping("/events/{eventId}")
    public CalendarContracts.CalendarEventResponse updateEvent(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID eventId,
            @RequestBody CalendarContracts.UpdateEventRequest request
    ) {
        UUID userId = requireUserId(principal);
        return calendarService.UpdateEvent(userId, eventId, request);
    }

    @DeleteMapping("/events/{eventId}")
    public void deleteEvent(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID eventId
    ) {
        UUID userId = requireUserId(principal);
        calendarService.DeleteEvent(userId, eventId);
    }

    // Note linking

    @PostMapping("/events/{eventId}/note/{noteId}")
    public CalendarContracts.CalendarEventResponse linkNote(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID eventId,
            @PathVariable UUID noteId
    ) {
        UUID userId = requireUserId(principal);
        return calendarService.LinkNoteToEvent(userId, eventId, noteId);
    }

    @DeleteMapping("/events/{eventId}/note")
    public CalendarContracts.CalendarEventResponse unlinkNote(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID eventId
    ) {
        UUID userId = requireUserId(principal);
        return calendarService.UnlinkNoteFromEvent(userId, eventId);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
    }

}
