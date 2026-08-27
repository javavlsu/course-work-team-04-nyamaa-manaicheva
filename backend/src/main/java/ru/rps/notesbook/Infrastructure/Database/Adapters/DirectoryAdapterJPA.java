package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DirectoryAdapterJPA extends JpaRepository<DirectoryEntity, UUID> {

    List<DirectoryEntity> findByOwner_Id(UUID ownerId);

    List<DirectoryEntity> findByOwner_IdAndDeletedAtIsNull(UUID ownerId);

    Optional<DirectoryEntity> findByIdAndDeletedAtIsNull(UUID id);

    // Stage 7.1: sync. Без filter по deletedAt - soft-deleted Directory должна попадать в результат.
    List<DirectoryEntity> findByUpdatedAtAfter(LocalDateTime timestamp);

}