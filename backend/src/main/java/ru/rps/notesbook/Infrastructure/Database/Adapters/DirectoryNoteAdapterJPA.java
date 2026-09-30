package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryNoteEntity;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryNoteId;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface DirectoryNoteAdapterJPA extends JpaRepository<DirectoryNoteEntity, DirectoryNoteId> {

    List<DirectoryNoteEntity> findByDirectory_Id(UUID directoryId);

    List<DirectoryNoteEntity> findByNote_Id(UUID noteId);

    void deleteByDirectory_Id(UUID directoryId);

    void deleteByNote_Id(UUID noteId);

    List<DirectoryNoteEntity> findByAddedAtAfter(LocalDateTime timestamp);

    @Query("select dn.note.id from DirectoryNoteEntity dn where dn.directory.id in :directoryIds")
    List<UUID> findNoteIdsByDirectoryIdIn(@Param("directoryIds") Collection<UUID> directoryIds);

    @Modifying
    @Query(value = "insert into directory_note (note_id, directory_id, added_at) " +
            "values (:noteId, :directoryId, :addedAt) on conflict (note_id, directory_id) do nothing",
            nativeQuery = true)
    int upsertDirectoryNote(@Param("noteId") UUID noteId, @Param("directoryId") UUID directoryId, @Param("addedAt") LocalDateTime addedAt);

    @Modifying
    @Query("delete from DirectoryNoteEntity dn where dn.id.noteId = :noteId and dn.id.directoryId = :directoryId")
    int deleteByNoteIdAndDirectoryIdSafe(@Param("noteId") UUID noteId, @Param("directoryId") UUID directoryId);

}