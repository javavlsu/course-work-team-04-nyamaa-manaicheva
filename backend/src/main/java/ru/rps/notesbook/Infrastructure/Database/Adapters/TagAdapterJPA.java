package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.TagEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagAdapterJPA extends JpaRepository<TagEntity, UUID> {

    List<TagEntity> findByOwner_Id(UUID ownerId);

    List<TagEntity> findByOwner_IdAndDeletedAtIsNull(UUID ownerId);

    Optional<TagEntity> findByIdAndDeletedAtIsNull(UUID id);

}