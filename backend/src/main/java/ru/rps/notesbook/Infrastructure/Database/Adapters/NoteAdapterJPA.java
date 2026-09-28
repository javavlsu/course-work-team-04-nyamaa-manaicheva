package ru.rps.notesbook.Infrastructure.Database.Adapters;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteEntity;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteAdapterJPA extends JpaRepository<NoteEntity, UUID> {

    List<NoteEntity> findByOwner_Id(UUID ownerId);

    List<NoteEntity> findByOwner_IdAndDeletedAtIsNull(UUID ownerId);

    Optional<NoteEntity> findByIdAndDeletedAtIsNull(UUID id);

    Optional<NoteEntity> findByIdAndDeletedAtIsNotNull(UUID id);

    List<NoteEntity> findByOwner_IdAndDeletedAtIsNotNull(UUID ownerId);

    List<NoteEntity> findByUpdatedAtAfter(LocalDateTime timestamp);

    List<NoteEntity> findByIdInAndDeletedAtIsNull(Collection<UUID> ids);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select n from NoteEntity n where n.id = :id and n.deletedAt is null")
    Optional<NoteEntity> findByIdAndDeletedAtIsNullForUpdate(@Param("id") UUID id);

}