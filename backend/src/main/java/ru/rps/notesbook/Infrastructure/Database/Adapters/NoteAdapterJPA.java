package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteAdapterJPA extends JpaRepository<NoteEntity, UUID> {

    List<NoteEntity> findByOwner_Id(UUID ownerId);

    List<NoteEntity> findByOwner_IdAndDeletedAtIsNull(UUID ownerId);

    Optional<NoteEntity> findByIdAndDeletedAtIsNull(UUID id);

    // Stage 7.1: sync. Без filter по deletedAt - soft-deleted Note должны попадать в результат.
    List<NoteEntity> findByUpdatedAtAfter(LocalDateTime timestamp);

}