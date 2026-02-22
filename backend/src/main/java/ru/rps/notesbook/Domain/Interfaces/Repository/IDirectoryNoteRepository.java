package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.DirectoryNote;

import java.util.List;
import java.util.UUID;

@Repository
public interface IDirectoryNoteRepository {
    List<DirectoryNote> GetDirectoriesNotesByDirectoryIdAsync(UUID directoryId);
    DirectoryNote CreateDirectoryNoteAsync(DirectoryNote directoryNote);
    DirectoryNote UpdateDirectoryNoteAsync(DirectoryNote directoryNote);
    void DeleteDirectoryNoteByDirectoryIdAsync(UUID directoryId);
    void DeleteDirectoryNoteByNoteIdAsync(UUID noteId);
}