package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.Note;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface INoteRepository {
    List<Note> GetNotesByUserId(UUID userId);
    Optional<Note> GetNoteById(UUID id);
    Note SaveNote(Note note);
    void DeleteNoteById(UUID id);

    // Stage 7.1: для pull-синхронизации. Soft-deleted Note НЕ должны отфильтровываться -
    // клиенту нужно узнать об удалении, если оно произошло после lastSyncAt.
    List<Note> GetNotesUpdatedAfter(LocalDateTime timestamp);
}
