package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.AttachmentEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttachmentAdapterJPA extends JpaRepository<AttachmentEntity, UUID> {

    List<AttachmentEntity> findByNote_Id(UUID noteId);

    void deleteByNote_Id(UUID noteId);

    @Query("select a.storageKey from AttachmentEntity a "
            + "where a.note.id in (select n.id from NoteEntity n where n.owner.id = :userId) "
            + "or a.createdBy.id = :userId")
    List<String> findStorageKeysRelatedToUser(@Param("userId") UUID userId);

}
