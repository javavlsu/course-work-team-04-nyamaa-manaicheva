package ru.rps.notesbook.API.Contracts;

import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;

import java.util.List;
import java.util.UUID;

// Stage 7.3: минимальные DTO для Push Sync (CLIENT -> SERVER).
// Пул поддерживаемых операций - CREATE/UPDATE/DELETE для Note и Directory.
// DirectoryNote в Push НЕ включён (см. Stage 7.3 audit) - используются существующие
// POST/DELETE /api/directories/{id}/notes/{noteId}.
public final class PushContracts {

    public enum PushOperationType { CREATE, UPDATE, DELETE }

    public enum PushResultStatus { OK, CONFLICT, FORBIDDEN, ERROR }

    public enum PushResourceType { NOTE, DIRECTORY }

    // Одна операция над Note. Поля title/content/noteType/isFavourite используются только
    // для CREATE/UPDATE (для DELETE игнорируются). expectedVersion используется для
    // UPDATE и DELETE; null означает "не проверять версию" (см. NoteService.UpdateNote/
    // DeleteNoteById). Для CREATE id - client-generated UUID.
    public record NotePushOperation(
            PushOperationType op,
            UUID id,
            String title,
            Object content,
            NoteTypeEnum noteType,
            boolean isFavourite,
            Long expectedVersion
    ) {}

    // Аналогично NotePushOperation, но для Directory (без content/noteType/isFavourite).
    public record DirectoryPushOperation(
            PushOperationType op,
            UUID id,
            String title,
            Long expectedVersion
    ) {}

    public record PushRequest(
            List<NotePushOperation> notes,
            List<DirectoryPushOperation> directories
    ) {}

    // Результат одной операции. currentVersion заполняется только при status == CONFLICT
    // и только если версия ресурса известна на момент ответа.
    public record PushOperationResult(
            PushResourceType resourceType,
            UUID id,
            PushResultStatus status,
            Long currentVersion,
            String message
    ) {}

    public record PushResponse(
            List<PushOperationResult> results
    ) {}

}
