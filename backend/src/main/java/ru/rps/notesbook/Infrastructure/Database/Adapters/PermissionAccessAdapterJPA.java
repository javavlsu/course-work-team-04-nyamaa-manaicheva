package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.PermissionAccessEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionAccessAdapterJPA extends JpaRepository<PermissionAccessEntity, UUID> {

    List<PermissionAccessEntity> findByUserGranted_IdAndDirectory_Id(UUID userId, UUID directoryId);

    Optional<PermissionAccessEntity> findByUserGranted_IdAndNote_Id(UUID userId, UUID noteId);

    List<PermissionAccessEntity> findByNote_Id(UUID noteId);

    List<PermissionAccessEntity> findByDirectory_Id(UUID directoryId);

    List<PermissionAccessEntity> findByUserGranted_Id(UUID userId);

    void deleteByNote_Id(UUID noteId);

    void deleteByDirectory_Id(UUID directoryId);

    @Query("select p.note.id from PermissionAccessEntity p where p.userGranted.id = :userId and p.note is not null")
    List<UUID> findGrantedNoteIdsByUserId(@Param("userId") UUID userId);

    @Query("select p.directory.id from PermissionAccessEntity p where p.userGranted.id = :userId and p.directory is not null")
    List<UUID> findGrantedDirectoryIdsByUserId(@Param("userId") UUID userId);

}