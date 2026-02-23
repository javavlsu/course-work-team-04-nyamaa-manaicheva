package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface DirectoryAdapterJPA extends JpaRepository<DirectoryEntity, UUID> {

    List<DirectoryEntity> findDirectoriesByOwnerId(UUID ownerId);

}