package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.PermissionAccessEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionAccessAdapterJPA extends JpaRepository<PermissionAccessEntity, UUID> {

    List<PermissionAccessEntity> findByUserIdAndDirectoryId(UUID userId, UUID directoryId);
    Optional<PermissionAccessEntity> findByUserIdAndNoteId(UUID userId, UUID noteId);
    void deleteByNoteId(UUID noteId);

}