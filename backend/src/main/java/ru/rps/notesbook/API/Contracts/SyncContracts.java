package ru.rps.notesbook.API.Contracts;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

// Stage 7.1/7.2: минимальные DTO для базовой pull-синхронизации.
// Синхронизируются пока только Note, Directory, DirectoryNote (без Comment/Attachment/Tag/
// NoteTag/PermissionAccess/NoteRevision - см. Context.md, Stage 7.1).
public final class SyncContracts {

    public record SyncRequest(
            LocalDateTime lastSyncAt
    ) {}

    public record SyncResponse(
            LocalDateTime syncAt,
            List<NoteContracts.NoteResponse> notes,
            List<DirectoryContracts.DirectoryResponse> directories,
            List<DirectoryNoteContracts.DirectoryNoteSyncResponse> directoryNotes,
            // Stage 7.2: полный текущий набор доступных ID (не только дельта). Нужен клиенту,
            // чтобы обнаружить отозванный доступ (revoke) - ресурс, который раньше был доступен,
            // но пропал из этого списка, нужно удалить локально. Дубликатов быть не может
            // (см. SyncService - используется LinkedHashSet).
            List<UUID> accessibleNoteIds,
            List<UUID> accessibleDirectoryIds
    ) {}

}
