package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteRevisionEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface NoteRevisionAdapterJPA extends JpaRepository<NoteRevisionEntity, UUID> {

    List<NoteRevisionEntity> findByNote_IdOrderByVersionDesc(UUID noteId);

    void deleteByNote_Id(UUID noteId);

    @Modifying(flushAutomatically = true)
    @Query("delete from NoteRevisionEntity r "
            + "where r.createdBy.id = :userId "
            + "or r.note.id in (select n.id from NoteEntity n where n.owner.id = :userId)")
    int deleteAllRelatedToUser(@Param("userId") UUID userId);

}