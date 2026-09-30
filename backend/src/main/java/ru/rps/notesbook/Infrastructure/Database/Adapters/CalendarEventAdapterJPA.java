package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.CalendarEventEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CalendarEventAdapterJPA extends JpaRepository<CalendarEventEntity, UUID> {

    List<CalendarEventEntity> findByCalendar_Id(UUID calendarId);

    List<CalendarEventEntity> findByCalendar_IdAndStartAtLessThanEqualAndEndAtGreaterThanEqual(
            UUID calendarId, LocalDateTime to, LocalDateTime from);

    List<CalendarEventEntity> findByNote_Id(UUID noteId);

    void deleteByCalendar_Id(UUID calendarId);

}
