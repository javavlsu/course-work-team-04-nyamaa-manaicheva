package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.DirectoryNote;

import java.util.List;
import java.util.UUID;

@Repository
public interface IDirectoryNoteRepository {
    List<DirectoryNote> GetDirectoriesNotesByDirectoryId(UUID directoryId);
    DirectoryNote SaveDirectoryNote(DirectoryNote directoryNote);
    void DeleteDirectoryNoteByDirectoryId(UUID directoryId);
    void DeleteDirectoryNoteByNoteId(UUID noteId);
}