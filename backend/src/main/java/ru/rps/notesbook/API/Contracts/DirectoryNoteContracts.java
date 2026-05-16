package ru.rps.notesbook.API.Contracts;

import java.util.UUID;

public final class DirectoryNoteContracts {

    public record DirectoryNoteResponse(
            UUID noteId,
            UUID directoryId
    ) {}

    public record CreateDirectoryNoteRequest(
            UUID noteId,
            UUID directoryId
    ) {}
}

