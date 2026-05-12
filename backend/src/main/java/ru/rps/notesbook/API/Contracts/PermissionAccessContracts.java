package ru.rps.notesbook.API.Contracts;

import ru.rps.notesbook.Domain.Enum.PermissionTypeEnum;

import java.util.UUID;

public final class PermissionAccessContracts {

    public record PermissionAccessResponse(
            UUID id,
            PermissionTypeEnum type,
            UUID noteId,
            UUID userId,
            UUID directoryId
    ) {}

    public record CreatePermissionAccessRequest(
            PermissionTypeEnum type,
            UUID noteId,
            UUID userId,
            UUID directoryId
    ) {}

    public record UpdatePermissionAccessRequest(
            PermissionTypeEnum type
    ) {}
}

