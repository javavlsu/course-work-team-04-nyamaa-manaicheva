package ru.rps.notesbook.API.Contracts;

import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;

import java.util.List;
import java.util.UUID;

public final class PushContracts {

    public enum PushOperationType { CREATE, UPDATE, DELETE }

    public enum PushResultStatus { OK, CONFLICT, FORBIDDEN, ERROR }

    public enum PushResourceType { NOTE, DIRECTORY }

    // title/content/noteType/isFavourite only for CREATE/UPDATE
    // expectedVersion only for UPDATE/DELETE (null – ignore)
    // for CREATE operation – client-generated UUID
    public record NotePushOperation(
            PushOperationType op,
            UUID id,
            String title,
            Object content,
            NoteTypeEnum noteType,
            boolean isFavourite,
            Long expectedVersion
    ) {}

    // title only for CREATE/UPDATE
    // expectedVersion only for UPDATE/DELETE (null – ignore)
    // for CREATE operation – client-generated UUID
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

    // Only one operation result
    // currentVersion is filled only when status == CONFLICT
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