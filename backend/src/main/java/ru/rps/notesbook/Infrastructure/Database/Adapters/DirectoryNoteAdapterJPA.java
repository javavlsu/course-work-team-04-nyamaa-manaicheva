package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryEntity;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryNoteEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface DirectoryNoteAdapterJPA extends JpaRepository<DirectoryNoteEntity, UUID> {

    List<DirectoryNoteEntity> findByDirectoryId(UUID directoryId);
    void deleteByDirectoryId(UUID directoryId);
    void deleteByNoteId(UUID noteId);

}