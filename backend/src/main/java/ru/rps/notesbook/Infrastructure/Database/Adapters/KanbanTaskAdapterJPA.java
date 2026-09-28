package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.KanbanTaskEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface KanbanTaskAdapterJPA extends JpaRepository<KanbanTaskEntity, UUID> {

    List<KanbanTaskEntity> findByColumn_Id(UUID columnId);

    List<KanbanTaskEntity> findByNote_Id(UUID noteId);

    List<KanbanTaskEntity> findByColumn_Board_Owner_IdAndArchivedTrue(UUID ownerId);

    void deleteByColumn_Id(UUID columnId);

    @Modifying(flushAutomatically = true)
    @Query("delete from KanbanTaskEntity t "
            + "where t.column.id in (select c.id from KanbanColumnEntity c where c.board.owner.id = :userId)")
    int deleteAllOnBoardsOwnedBy(@Param("userId") UUID userId);

    @Modifying(flushAutomatically = true)
    @Query("update KanbanTaskEntity t set t.note = null "
            + "where t.note.id in (select n.id from NoteEntity n where n.owner.id = :userId)")
    int detachNotesOwnedBy(@Param("userId") UUID userId);

}
