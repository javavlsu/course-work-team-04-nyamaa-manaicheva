package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.Note;

import java.util.List;
import java.util.UUID;

@Repository
public interface INoteRepository {
    List<Note> GetNotesByUserIdAsync(UUID userId);
    Note GetNoteByIdAsync(UUID id);
    Note CreateNoteAsync(Note note);
    Note UpdateNoteAsync(Note note);
    void DeleteNoteByIdAsync(UUID id);
}
