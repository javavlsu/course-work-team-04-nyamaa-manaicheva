package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.Note;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface INoteRepository {
    List<Note> GetNotesByUserId(UUID userId);
    Optional<Note> GetNoteById(UUID id);
    Note SaveNote(Note note);
    void DeleteNoteById(UUID id);
}
