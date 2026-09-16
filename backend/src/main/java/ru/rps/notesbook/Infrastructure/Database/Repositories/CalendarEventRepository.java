package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.Domain.Interfaces.Repository.ICalendarEventRepository;
import ru.rps.notesbook.Domain.Models.CalendarEvent;
import ru.rps.notesbook.Infrastructure.Database.Adapters.CalendarEventAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.CalendarEventEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.CalendarEventMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CalendarEventRepository implements ICalendarEventRepository {

    private final CalendarEventAdapterJPA calendarEventAdapterJPA;
    private final CalendarEventMapper calendarEventMapper;

    @Override
    public List<CalendarEvent> GetEventsByCalendarId(UUID calendarId)
    {
        return calendarEventAdapterJPA.findByCalendar_Id(calendarId)
                .stream()
                .map(calendarEventMapper::ToDomain)
                .toList();
    }

    @Override
    public List<CalendarEvent> GetEventsByCalendarIdAndRange(UUID calendarId, LocalDateTime from, LocalDateTime to)
    {
        return calendarEventAdapterJPA
                .findByCalendar_IdAndStartAtLessThanEqualAndEndAtGreaterThanEqual(calendarId, to, from)
                .stream()
                .map(calendarEventMapper::ToDomain)
                .toList();
    }

    @Override
    public List<CalendarEvent> GetEventsByNoteId(UUID noteId)
    {
        return calendarEventAdapterJPA.findByNote_Id(noteId)
                .stream()
                .map(calendarEventMapper::ToDomain)
                .toList();
    }

    @Override
    public Optional<CalendarEvent> GetEventById(UUID id)
    {
        return calendarEventAdapterJPA.findById(id).map(calendarEventMapper::ToDomain);
    }

    @Override
    @Transactional
    public CalendarEvent SaveEvent(CalendarEvent event)
    {
        CalendarEventEntity entity = calendarEventMapper.ToEntity(event);

        CalendarEventEntity savedEntity = calendarEventAdapterJPA.save(entity);

        return calendarEventMapper.ToDomain(savedEntity);
    }

    @Override
    public void DeleteEventById(UUID id)
    {
        calendarEventAdapterJPA.deleteById(id);
    }

    @Override
    @Transactional
    public void DeleteEventsByCalendarId(UUID calendarId)
    {
        calendarEventAdapterJPA.deleteByCalendar_Id(calendarId);
    }

}
