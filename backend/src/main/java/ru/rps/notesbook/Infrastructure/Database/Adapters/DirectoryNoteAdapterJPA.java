package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryNoteEntity;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryNoteId;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DirectoryNoteAdapterJPA extends JpaRepository<DirectoryNoteEntity, DirectoryNoteId> {

    List<DirectoryNoteEntity> findByDirectory_Id(UUID directoryId);

    List<DirectoryNoteEntity> findByNote_Id(UUID noteId);

    void deleteByDirectory_Id(UUID directoryId);

    void deleteByNote_Id(UUID noteId);

    // Stage 7.1: sync. Отслеживает только добавление связи (удаление не отслеживается - см. IDirectoryNoteRepository).
    List<DirectoryNoteEntity> findByAddedAtAfter(LocalDateTime timestamp);

}