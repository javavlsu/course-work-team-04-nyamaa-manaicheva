package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.KanbanColumnEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface KanbanColumnAdapterJPA extends JpaRepository<KanbanColumnEntity, UUID> {

    List<KanbanColumnEntity> findByBoard_Id(UUID boardId);

    void deleteByBoard_Id(UUID boardId);

    @Modifying(flushAutomatically = true)
    @Query("delete from KanbanColumnEntity c "
            + "where c.board.id in (select b.id from KanbanBoardEntity b where b.owner.id = :userId)")
    int deleteAllOnBoardsOwnedBy(@Param("userId") UUID userId);

}
