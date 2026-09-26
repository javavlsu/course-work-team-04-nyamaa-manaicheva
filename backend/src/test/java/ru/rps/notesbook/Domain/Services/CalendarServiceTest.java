package ru.rps.notesbook.Domain.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.CalendarContracts;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.ICalendarEventRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.ICalendarRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Models.Calendar;
import ru.rps.notesbook.Domain.Models.CalendarEvent;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Юнит-тесты для {@link CalendarService}.
 * Соответствует пунктам 33-39 чек-листа, раздел "Сервис CalendarService" (клиентский модуль).
 * В отличие от Directory/Comment, все проверки владения здесь реализованы в самом сервисе,
 * поэтому отдельный ControllerTest не требуется.
 */
@ExtendWith(MockitoExtension.class)
class CalendarServiceTest {

    @Mock
    private ICalendarRepository calendarRepository;
    @Mock
    private ICalendarEventRepository calendarEventRepository;
    @Mock
    private IUserRepository userRepository;
    @Mock
    private INoteRepository noteRepository;

    private CalendarService calendarService;

    private User owner;
    private UUID ownerId;
    private User otherUser;
    private UUID otherUserId;

    @BeforeEach
    void setUp() {
        calendarService = new CalendarService(calendarRepository, calendarEventRepository, userRepository, noteRepository);

        ownerId = UUID.randomUUID();
        owner = new User(ownerId, "Иван", "Иванов", "ivan@example.com",
                LocalDate.of(1995, 1, 1), LocalDateTime.now(), "hash", RoleTypeEnum.Client);

        otherUserId = UUID.randomUUID();
        otherUser = new User(otherUserId, "Пётр", "Петров", "petr@example.com",
                LocalDate.of(1996, 2, 2), LocalDateTime.now(), "hash", RoleTypeEnum.Client);
    }

    // 33. Получение/создание календаря при первом обращении
    @Test
    void getOrCreateCalendarForUser_whenNoneExists_shouldCreateNewCalendar() {
        when(calendarRepository.GetCalendarByOwnerId(ownerId)).thenReturn(Optional.empty());
        when(userRepository.GetUserById(ownerId)).thenReturn(Optional.of(owner));
        when(calendarRepository.SaveCalendar(any(Calendar.class))).thenAnswer(inv -> inv.getArgument(0));

        CalendarContracts.CalendarResponse response = calendarService.GetOrCreateCalendarForUser(ownerId);

        assertNotNull(response.id());
        assertEquals(ownerId, response.ownerId());
        verify(calendarRepository, times(1)).SaveCalendar(any(Calendar.class));
    }

    // 34. Создание события в своём календаре
    @Test
    void createEvent_inOwnCalendar_shouldCreateEvent() {
        UUID calendarId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();
        Calendar calendar = new Calendar(calendarId, owner, now);
        when(calendarRepository.GetCalendarById(calendarId)).thenReturn(Optional.of(calendar));
        when(calendarEventRepository.SaveEvent(any(CalendarEvent.class))).thenAnswer(inv -> inv.getArgument(0));
        when(calendarRepository.SaveCalendar(any(Calendar.class))).thenAnswer(inv -> inv.getArgument(0));

        CalendarContracts.CreateEventRequest request = new CalendarContracts.CreateEventRequest(
                "Встреча", "Обсудить проект", now.plusHours(1), now.plusHours(2), false, null);

        CalendarContracts.CalendarEventResponse response = calendarService.CreateEvent(ownerId, calendarId, request);

        assertEquals("Встреча", response.title());
        assertEquals(calendarId, response.calendarId());
        verify(calendarEventRepository, times(1)).SaveEvent(any(CalendarEvent.class));
        verify(calendarRepository, times(1)).SaveCalendar(calendar);
    }

    // 35. Создание события в чужом календаре
    @Test
    void createEvent_inForeignCalendar_shouldThrowForbidden() {
        UUID calendarId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();
        Calendar calendar = new Calendar(calendarId, otherUser, now);
        when(calendarRepository.GetCalendarById(calendarId)).thenReturn(Optional.of(calendar));

        CalendarContracts.CreateEventRequest request = new CalendarContracts.CreateEventRequest(
                "Встреча", null, now.plusHours(1), now.plusHours(2), false, null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> calendarService.CreateEvent(ownerId, calendarId, request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(calendarEventRepository, never()).SaveEvent(any());
    }

    // 36. Запрос событий с диапазоном, где конец раньше начала
    @Test
    void getEventsByRange_withEndBeforeStart_shouldThrowBadRequest() {
        UUID calendarId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();
        Calendar calendar = new Calendar(calendarId, owner, now);
        when(calendarRepository.GetCalendarById(calendarId)).thenReturn(Optional.of(calendar));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> calendarService.GetEventsByRange(ownerId, calendarId, now, now.minusDays(1)));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    // 37. Привязка чужой заметки к событию
    @Test
    void linkNoteToEvent_withForeignNote_shouldThrowForbidden() {
        UUID calendarId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID noteId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        Calendar calendar = new Calendar(calendarId, owner, now);
        CalendarEvent event = new CalendarEvent(eventId, calendar, "Событие", null,
                now.plusHours(1), now.plusHours(2), false, null, now);
        when(calendarEventRepository.GetEventById(eventId)).thenReturn(Optional.of(event));

        Note foreignNote = new Note(noteId, "Чужая заметка", null, now, NoteTypeEnum.Empty, false, otherUser);
        when(noteRepository.GetNoteById(noteId)).thenReturn(Optional.of(foreignNote));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> calendarService.LinkNoteToEvent(ownerId, eventId, noteId));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(calendarEventRepository, never()).SaveEvent(any());
    }

    // 38. Перенос события на новое время
    @Test
    void updateEvent_reschedule_shouldChangeStartAndEndTime() {
        UUID calendarId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        Calendar calendar = new Calendar(calendarId, owner, now);
        CalendarEvent event = new CalendarEvent(eventId, calendar, "Событие", null,
                now.plusHours(1), now.plusHours(2), false, null, now);
        when(calendarEventRepository.GetEventById(eventId)).thenReturn(Optional.of(event));
        when(calendarEventRepository.SaveEvent(any(CalendarEvent.class))).thenAnswer(inv -> inv.getArgument(0));

        LocalDateTime newStart = now.plusDays(1);
        LocalDateTime newEnd = now.plusDays(1).plusHours(1);
        CalendarContracts.UpdateEventRequest request =
                new CalendarContracts.UpdateEventRequest(null, null, newStart, newEnd, null);

        CalendarContracts.CalendarEventResponse response = calendarService.UpdateEvent(ownerId, eventId, request);

        assertEquals(newStart, response.startAt());
        assertEquals(newEnd, response.endAt());
    }

    // 39. Получение событий за диапазон дат
    @Test
    void getEventsByRange_shouldReturnEventsSortedByStartTime() {
        UUID calendarId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();
        Calendar calendar = new Calendar(calendarId, owner, now);
        when(calendarRepository.GetCalendarById(calendarId)).thenReturn(Optional.of(calendar));

        CalendarEvent later = new CalendarEvent(UUID.randomUUID(), calendar, "Позже", null,
                now.plusHours(5), now.plusHours(6), false, null, now);
        CalendarEvent earlier = new CalendarEvent(UUID.randomUUID(), calendar, "Раньше", null,
                now.plusHours(1), now.plusHours(2), false, null, now);
        when(calendarEventRepository.GetEventsByCalendarIdAndRange(calendarId, now, now.plusDays(1)))
                .thenReturn(List.of(later, earlier));

        List<CalendarContracts.CalendarEventResponse> events =
                calendarService.GetEventsByRange(ownerId, calendarId, now, now.plusDays(1));

        assertEquals(2, events.size());
        assertEquals("Раньше", events.get(0).title());
        assertEquals("Позже", events.get(1).title());
    }

}
