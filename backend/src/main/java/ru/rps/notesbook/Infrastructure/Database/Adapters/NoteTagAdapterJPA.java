package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteTagEntity;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteTagId;

import java.util.List;
import java.util.UUID;

@Repository
public interface NoteTagAdapterJPA extends JpaRepository<NoteTagEntity, NoteTagId> {

    List<NoteTagEntity> findByNote_Id(UUID noteId);

    void deleteByNote_Id(UUID noteId);

    void deleteByTag_Id(UUID tagId);

    @Modifying(flushAutomatically = true)
    @Query("delete from NoteTagEntity nt "
            + "where nt.note.id in (select n.id from NoteEntity n where n.owner.id = :userId) "
            + "or nt.tag.id in (select t.id from TagEntity t where t.owner.id = :userId)")
    int deleteAllRelatedToUser(@Param("userId") UUID userId);

}