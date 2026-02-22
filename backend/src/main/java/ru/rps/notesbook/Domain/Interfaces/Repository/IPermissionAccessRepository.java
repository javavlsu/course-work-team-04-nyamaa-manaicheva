package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.PermissionAccess;

import java.util.List;
import java.util.UUID;

@Repository
public interface IPermissionAccessRepository {
    List<PermissionAccess> GetPermissionAccessesByUserIdAndDirectoryIdAsync(UUID userId, UUID directoryId);
    PermissionAccess GetPermissionAccessByNoteIdAndDirectoryIdAsync(UUID userId, UUID noteId);
    PermissionAccess GetPermissionAccessByIdAsync(UUID id);
    PermissionAccess CreatePermissionAccessAsync(PermissionAccess permissionAccess);
    PermissionAccess UpdatePermissionAccessAsync(PermissionAccess permissionAccess);
    void DeletePermissionAccessByIdAsync(UUID id);
    void DeletePermissionAccessByNoteIdAsync(UUID noteId);
}
