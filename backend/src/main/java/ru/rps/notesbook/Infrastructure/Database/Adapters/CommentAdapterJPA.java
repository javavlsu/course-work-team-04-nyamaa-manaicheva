package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
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

}