package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.Calendar;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ICalendarRepository {

    Optional<Calendar> GetCalendarById(UUID id);
    Optional<Calendar> GetCalendarByOwnerId(UUID ownerId);
    Calendar SaveCalendar(Calendar calendar);
    void DeleteCalendarById(UUID id);

}
