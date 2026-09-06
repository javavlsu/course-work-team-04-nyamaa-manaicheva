package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.KanbanBoardEntity;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface KanbanBoardAdapterJPA extends JpaRepository<KanbanBoardEntity, UUID> {

    Optional<KanbanBoardEntity> findByOwner_Id(UUID ownerId);

}
