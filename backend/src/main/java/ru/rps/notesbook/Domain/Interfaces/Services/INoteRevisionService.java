package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.NoteRevisionContracts;

import java.util.List;
import java.util.UUID;

public interface INoteRevisionService {

    List<NoteRevisionContracts.NoteRevisionResponse> GetRevisionsByNoteId(UUID noteId);

    NoteRevisionContracts.NoteRevisionResponse GetRevisionById(UUID id);

}