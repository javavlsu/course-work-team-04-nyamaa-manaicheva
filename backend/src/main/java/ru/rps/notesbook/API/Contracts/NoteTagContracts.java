package ru.rps.notesbook.API.Contracts;

import java.util.UUID;

public final class NoteTagContracts {

    public record NoteTagResponse(
            UUID noteId,
            UUID tagId
    ) {}

    public record CreateNoteTagRequest(
            UUID noteId,
            UUID tagId
    ) {}

}