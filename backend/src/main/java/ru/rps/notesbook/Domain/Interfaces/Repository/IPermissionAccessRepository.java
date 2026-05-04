package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.PermissionAccess;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IPermissionAccessRepository {
    List<PermissionAccess> GetPermissionAccessesByUserIdAndDirectoryId(UUID userId, UUID directoryId);
    Optional<PermissionAccess> GetPermissionAccessByUserIdAndNoteId(UUID userId, UUID noteId);
    Optional<PermissionAccess> GetPermissionAccessById(UUID id);
    PermissionAccess SavePermissionAccess(PermissionAccess permissionAccess);
    void DeletePermissionAccessById(UUID id);
    void DeletePermissionAccessByNoteId(UUID noteId);
}
