package ru.rps.notesbook.API.Contracts;

import java.time.LocalDateTime;
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

    // Stage 7.1: отдельный DTO для sync - в отличие от DirectoryNoteResponse несёт addedAt,
    // чтобы клиент мог определить момент добавления связи Note-Directory.
    public record DirectoryNoteSyncResponse(
            UUID noteId,
            UUID directoryId,
            LocalDateTime addedAt
    ) {}
}

