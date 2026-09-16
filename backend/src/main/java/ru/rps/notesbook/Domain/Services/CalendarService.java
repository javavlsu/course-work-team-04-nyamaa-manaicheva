package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.CalendarContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.ICalendarEventRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.ICalendarRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.ICalendarService;
import ru.rps.notesbook.Domain.Models.Calendar;
import ru.rps.notesbook.Domain.Models.CalendarEvent;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CalendarService implements ICalendarService {

    private final ICalendarRepository calendarRepository;
    private final ICalendarEventRepository calendarEventRepository;
    private final IUserRepository userRepository;
    private final INoteRepository noteRepository;

    // Calendar

    @Override
    @Transactional
    public CalendarContracts.CalendarResponse GetOrCreateCalendarForUser(UUID ownerId) {
        Calendar calendar = calendarRepository.GetCalendarByOwnerId(ownerId)
                .orElseGet(() -> {
                    User owner = userRepository.GetUserById(ownerId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

                    Calendar newCalendar = new Calendar(UUID.randomUUID(), owner, LocalDateTime.now());

                    return calendarRepository.SaveCalendar(newCalendar);
                });

        return toCalendarResponse(calendar);
    }

    // Events

    @Override
    @Transactional
    public CalendarContracts.CalendarEventResponse CreateEvent(UUID currentUserId, UUID calendarId, CalendarContracts.CreateEventRequest request) {
        Calendar calendar = getOwnedCalendarOrThrow(currentUserId, calendarId);

        Note note = request.noteId() != null ? getOwnedNoteOrThrow(currentUserId, request.noteId()) : null;
        boolean allDay = request.allDay() != null && request.allDay();

        CalendarEvent event = new CalendarEvent(
                UUID.randomUUID(),
                calendar,
                request.title(),
                request.description(),
                request.startAt(),
                request.endAt(),
                allDay,
                note,
                LocalDateTime.now()
        );

        CalendarEvent saved = calendarEventRepository.SaveEvent(event);

        calendar.Touch();
        calendarRepository.SaveCalendar(calendar);

        return toEventResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CalendarContracts.CalendarEventResponse GetEventById(UUID currentUserId, UUID eventId) {
        CalendarEvent event = getOwnedEventOrThrow(currentUserId, eventId);

        return toEventResponse(event);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalendarContracts.CalendarEventResponse> GetEventsByRange(UUID currentUserId, UUID calendarId, LocalDateTime from, LocalDateTime to) {
        getOwnedCalendarOrThrow(currentUserId, calendarId);

        if (from == null || to == null || to.isBefore(from)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Некорректный диапазон дат");
        }

        return calendarEventRepository.GetEventsByCalendarIdAndRange(calendarId, from, to).stream()
                .sorted(Comparator.comparing(CalendarEvent::GetStartAt))
                .map(CalendarService::toEventResponse)
                .toList();
    }

    @Override
    @Transactional
    public CalendarContracts.CalendarEventResponse UpdateEvent(UUID currentUserId, UUID eventId, CalendarContracts.UpdateEventRequest request) {
        CalendarEvent event = getOwnedEventOrThrow(currentUserId, eventId);

        if (request.title() != null) {
            event.ChangeTitle(request.title());
        }
        if (request.description() != null) {
            event.ChangeDescription(request.description());
        }
        if (request.startAt() != null || request.endAt() != null) {
            LocalDateTime newStart = request.startAt() != null ? request.startAt() : event.GetStartAt();
            LocalDateTime newEnd = request.endAt() != null ? request.endAt() : event.GetEndAt();
            event.Reschedule(newStart, newEnd);
        }
        if (request.allDay() != null) {
            event.ChangeAllDay(request.allDay());
        }

        return toEventResponse(calendarEventRepository.SaveEvent(event));
    }

    @Override
    @Transactional
    public void DeleteEvent(UUID currentUserId, UUID eventId) {
        CalendarEvent event = getOwnedEventOrThrow(currentUserId, eventId);

        calendarEventRepository.DeleteEventById(event.GetId());
    }

    @Override
    @Transactional
    public CalendarContracts.CalendarEventResponse LinkNoteToEvent(UUID currentUserId, UUID eventId, UUID noteId) {
        CalendarEvent event = getOwnedEventOrThrow(currentUserId, eventId);
        Note note = getOwnedNoteOrThrow(currentUserId, noteId);

        event.LinkNote(note);

        return toEventResponse(calendarEventRepository.SaveEvent(event));
    }

    @Override
    @Transactional
    public CalendarContracts.CalendarEventResponse UnlinkNoteFromEvent(UUID currentUserId, UUID eventId) {
        CalendarEvent event = getOwnedEventOrThrow(currentUserId, eventId);

        event.UnlinkNote();

        return toEventResponse(calendarEventRepository.SaveEvent(event));
    }

    // Ownership helpers

    private Calendar getOwnedCalendarOrThrow(UUID currentUserId, UUID calendarId) {
        Calendar calendar = calendarRepository.GetCalendarById(calendarId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendar not found"));

        requireCalendarOwner(currentUserId, calendar);

        return calendar;
    }

    private CalendarEvent getOwnedEventOrThrow(UUID currentUserId, UUID eventId) {
        CalendarEvent event = calendarEventRepository.GetEventById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendar event not found"));

        requireCalendarOwner(currentUserId, event.GetCalendar());

        return event;
    }

    private Note getOwnedNoteOrThrow(UUID currentUserId, UUID noteId) {
        Note note = noteRepository.GetNoteById(noteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));

        if (!note.GetOwner().GetId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Нельзя привязать чужую заметку к событию");
        }

        return note;
    }

    private void requireCalendarOwner(UUID currentUserId, Calendar calendar) {
        if (!calendar.GetOwner().GetId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Доступ к чужому календарю запрещён");
        }
    }

    // Mapping helpers

    private static CalendarContracts.CalendarResponse toCalendarResponse(Calendar calendar) {
        return new CalendarContracts.CalendarResponse(
                calendar.GetId(),
                calendar.GetOwner().GetId(),
                calendar.GetCreatedAt(),
                calendar.GetUpdatedAt()
        );
    }

    private static CalendarContracts.CalendarEventResponse toEventResponse(CalendarEvent event) {
        return new CalendarContracts.CalendarEventResponse(
                event.GetId(),
                event.GetCalendar().GetId(),
                event.GetTitle(),
                event.GetDescription(),
                event.GetStartAt(),
                event.GetEndAt(),
                event.IsAllDay(),
                event.GetNote() != null ? event.GetNote().GetId() : null,
                event.GetCreatedAt(),
                event.GetUpdatedAt()
        );
    }

}