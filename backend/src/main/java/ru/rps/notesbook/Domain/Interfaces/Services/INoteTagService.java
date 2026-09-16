package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.NoteTagContracts;

import java.util.List;
import java.util.UUID;

public interface INoteTagService {

    List<NoteTagContracts.NoteTagResponse> GetTagsByNoteId(UUID noteId);

    NoteTagContracts.NoteTagResponse AddTagToNote(NoteTagContracts.CreateNoteTagRequest request);

    void RemoveTagFromNote(UUID noteId, UUID tagId);

}