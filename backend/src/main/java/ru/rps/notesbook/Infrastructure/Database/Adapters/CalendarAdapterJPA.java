package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.CalendarEntity;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CalendarAdapterJPA extends JpaRepository<CalendarEntity, UUID> {

    Optional<CalendarEntity> findByOwner_Id(UUID ownerId);

}
