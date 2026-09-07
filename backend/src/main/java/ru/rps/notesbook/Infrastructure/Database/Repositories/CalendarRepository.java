package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.Domain.Interfaces.Repository.ICalendarRepository;
import ru.rps.notesbook.Domain.Models.Calendar;
import ru.rps.notesbook.Infrastructure.Database.Adapters.CalendarAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.CalendarEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.CalendarMapper;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CalendarRepository implements ICalendarRepository {

    private final CalendarAdapterJPA calendarAdapterJPA;
    private final CalendarMapper calendarMapper;

    @Override
    public Optional<Calendar> GetCalendarById(UUID id)
    {
        return calendarAdapterJPA.findById(id).map(calendarMapper::ToDomain);
    }

    @Override
    public Optional<Calendar> GetCalendarByOwnerId(UUID ownerId)
    {
        return calendarAdapterJPA.findByOwner_Id(ownerId).map(calendarMapper::ToDomain);
    }

    @Override
    @Transactional
    public Calendar SaveCalendar(Calendar calendar)
    {
        CalendarEntity entity = calendarMapper.ToEntity(calendar);

        CalendarEntity savedEntity = calendarAdapterJPA.save(entity);

        return calendarMapper.ToDomain(savedEntity);
    }

    @Override
    public void DeleteCalendarById(UUID id)
    {
        calendarAdapterJPA.deleteById(id);
    }

}
