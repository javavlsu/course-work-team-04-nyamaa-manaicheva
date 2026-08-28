package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.NoteContracts;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;

import java.util.List;
import java.util.UUID;

public interface INoteService {

    List<NoteContracts.NoteResponse> GetNotesByOwnerId(UUID ownerId);

    NoteContracts.NoteResponse GetNoteById(UUID id);

    NoteContracts.NoteResponse CreateNote(UUID ownerId, NoteContracts.CreateNoteRequest request);

    // for push sync only with client-generated UUID
    NoteContracts.NoteResponse CreateNote(UUID id, UUID ownerId, NoteContracts.CreateNoteRequest request);

    NoteContracts.NoteResponse UpdateNote(UUID id, NoteContracts.UpdateNoteRequest request);

    NoteContracts.NoteResponse favouriteChangeNote(UUID id);

    void DeleteNoteById(UUID id);

    void DeleteNoteById(UUID id, Long expectedVersion);

}