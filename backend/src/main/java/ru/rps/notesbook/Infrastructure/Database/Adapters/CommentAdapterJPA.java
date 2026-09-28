package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.CommentEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommentAdapterJPA extends JpaRepository<CommentEntity, UUID> {

    List<CommentEntity> findByNote_Id(UUID noteId);

    List<CommentEntity> findByNote_IdAndDeletedAtIsNull(UUID noteId);

    Optional<CommentEntity> findByIdAndDeletedAtIsNull(UUID id);

    void deleteByNote_Id(UUID noteId);

    @Modifying(flushAutomatically = true)
    @Query("delete from CommentEntity c "
            + "where c.author.id = :userId "
            + "or c.note.id in (select n.id from NoteEntity n where n.owner.id = :userId)")
    int deleteAllRelatedToUser(@Param("userId") UUID userId);

}