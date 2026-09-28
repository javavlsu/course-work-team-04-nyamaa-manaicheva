package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Modifying(flushAutomatically = true)
    @Query("delete from CalendarEventEntity e "
            + "where e.calendar.id in (select c.id from CalendarEntity c where c.owner.id = :userId)")
    int deleteAllInCalendarsOwnedBy(@Param("userId") UUID userId);

    @Modifying(flushAutomatically = true)
    @Query("update CalendarEventEntity e set e.note = null "
            + "where e.note.id in (select n.id from NoteEntity n where n.owner.id = :userId)")
    int detachNotesOwnedBy(@Param("userId") UUID userId);

}
