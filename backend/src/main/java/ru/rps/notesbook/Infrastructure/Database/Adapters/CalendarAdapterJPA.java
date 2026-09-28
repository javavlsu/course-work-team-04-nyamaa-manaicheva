package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.CalendarEntity;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CalendarAdapterJPA extends JpaRepository<CalendarEntity, UUID> {

    Optional<CalendarEntity> findByOwner_Id(UUID ownerId);

    @Modifying(flushAutomatically = true)
    @Query("delete from CalendarEntity c where c.owner.id = :userId")
    int deleteAllByOwnerId(@Param("userId") UUID userId);

}
