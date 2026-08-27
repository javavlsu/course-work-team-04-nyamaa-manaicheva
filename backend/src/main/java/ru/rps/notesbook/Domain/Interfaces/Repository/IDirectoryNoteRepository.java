package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.DirectoryNote;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface IDirectoryNoteRepository {

    List<DirectoryNote> GetDirectoriesNotesByDirectoryId(UUID directoryId);
    List<DirectoryNote> GetDirectoriesNotesByNoteId(UUID noteId);
    boolean ExistsByNoteIdAndDirectoryId(UUID noteId, UUID directoryId);
    DirectoryNote SaveDirectoryNote(DirectoryNote directoryNote);
    void DeleteDirectoryNoteByDirectoryId(UUID directoryId);
    void DeleteDirectoryNoteByNoteId(UUID noteId);
    void DeleteDirectoryNoteByNoteIdAndDirectoryId(UUID noteId, UUID directoryId);

    // Stage 7.1: для pull-синхронизации. V1-ограничение: отслеживается только добавление связи
    // (addedAt); физическое удаление DirectoryNote не оставляет следа, поэтому удаление связи
    // через sync пока не отслеживается.
    List<DirectoryNote> GetDirectoryNotesAddedAfter(LocalDateTime timestamp);

}