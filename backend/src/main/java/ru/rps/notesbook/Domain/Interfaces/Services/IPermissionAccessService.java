package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.PermissionAccessContracts;

import java.util.List;
import java.util.UUID;

public interface IPermissionAccessService {

    boolean canViewNote(UUID userId, UUID noteId);
    boolean canEditNote(UUID userId, UUID noteId);
    boolean canViewDirectory(UUID userId, UUID directoryId);
    boolean canEditDirectory(UUID userId, UUID directoryId);

    PermissionAccessContracts.PermissionAccessResponse GrantPermission(
        UUID currentUserId, 
        PermissionAccessContracts.CreatePermissionAccessRequest request
    );

    PermissionAccessContracts.PermissionAccessResponse UpdatePermission(
        UUID currentUserId, 
        UUID id, 
        PermissionAccessContracts.UpdatePermissionAccessRequest request
    );

    void RevokePermission(UUID currentUserId, UUID id);

    List<PermissionAccessContracts.PermissionAccessResponse> GetPermissionsByNoteId(
        UUID currentUserId, 
        UUID noteId
    );

    List<PermissionAccessContracts.PermissionAccessResponse> GetPermissionsByDirectoryId(
        UUID currentUserId, 
        UUID directoryId
    );

}