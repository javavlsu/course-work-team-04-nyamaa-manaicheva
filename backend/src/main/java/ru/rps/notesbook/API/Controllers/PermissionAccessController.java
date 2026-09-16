package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.PermissionAccessContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.IPermissionAccessService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class PermissionAccessController {

    private final IPermissionAccessService permissionAccessService;

    @PostMapping("/api/permissions")
    public PermissionAccessContracts.PermissionAccessResponse grantPermission(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @RequestBody PermissionAccessContracts.CreatePermissionAccessRequest request
    ) {
        UUID userId = requireUserId(principal);
        return permissionAccessService.GrantPermission(userId, request);
    }

    @PutMapping("/api/permissions/{id}")
    public PermissionAccessContracts.PermissionAccessResponse updatePermission(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody PermissionAccessContracts.UpdatePermissionAccessRequest request
    ) {
        UUID userId = requireUserId(principal);
        return permissionAccessService.UpdatePermission(userId, id, request);
    }

    @DeleteMapping("/api/permissions/{id}")
    public void revokePermission(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID userId = requireUserId(principal);
        permissionAccessService.RevokePermission(userId, id);
    }

    @GetMapping("/api/notes/{id}/permissions")
    public List<PermissionAccessContracts.PermissionAccessResponse> listPermissionsForNote(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID userId = requireUserId(principal);
        return permissionAccessService.GetPermissionsByNoteId(userId, id);
    }

    @GetMapping("/api/directories/{id}/permissions")
    public List<PermissionAccessContracts.PermissionAccessResponse> listPermissionsForDirectory(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID userId = requireUserId(principal);
        return permissionAccessService.GetPermissionsByDirectoryId(userId, id);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
    }

}