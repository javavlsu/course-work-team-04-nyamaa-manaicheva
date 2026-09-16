package ru.rps.notesbook.API.Contracts;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class SyncContracts {

    public record SyncRequest(
            LocalDateTime lastSyncAt
    ) {}

    public record SyncResponse(
            LocalDateTime syncAt,
            List<NoteContracts.NoteResponse> notes,
            List<DirectoryContracts.DirectoryResponse> directories,
            List<DirectoryNoteContracts.DirectoryNoteSyncResponse> directoryNotes,

            List<UUID> accessibleNoteIds,
            List<UUID> accessibleDirectoryIds
    ) {}

}