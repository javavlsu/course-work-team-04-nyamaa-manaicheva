package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.NoteContracts;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;

import java.util.List;
import java.util.UUID;

public interface INoteService {

    List<NoteContracts.NoteResponse> GetNotesByOwnerId(UUID ownerId);

    NoteContracts.NoteResponse GetNoteById(UUID id);

    NoteContracts.NoteResponse CreateNote(UUID ownerId, String title, String content, NoteTypeEnum noteType, boolean isFavourite);

    NoteContracts.NoteResponse UpdateNote(UUID id, NoteContracts.UpdateNoteRequest note);

    NoteContracts.NoteResponse favouriteChangeNote(UUID id);

    void DeleteNoteById(UUID id);

}