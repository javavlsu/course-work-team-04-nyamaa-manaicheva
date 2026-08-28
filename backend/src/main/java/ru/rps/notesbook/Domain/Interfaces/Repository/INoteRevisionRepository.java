package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.NoteRevision;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface INoteRevisionRepository {

    List<NoteRevision> GetRevisionsByNoteId(UUID noteId);
    Optional<NoteRevision> GetRevisionById(UUID id);
    NoteRevision SaveRevision(NoteRevision revision);
    void DeleteRevisionById(UUID id);
    void DeleteRevisionsByNoteId(UUID noteId);
    
}