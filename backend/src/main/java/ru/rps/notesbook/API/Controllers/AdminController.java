package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.AdminContracts;
import ru.rps.notesbook.API.Contracts.UserContracts;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Services.IAdminService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private static final String ADMIN_AUTHORITY = "ROLE_" + RoleTypeEnum.Admin.name().toUpperCase();

    private final IAdminService adminService;

    @PostMapping("/users")
    public ResponseEntity<UserContracts.UserResponse> createUser(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @RequestBody UserContracts.CreateUserRequest request
    ) {
        requireAdmin(principal);

        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(adminService.CreateUser(request));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID actorId = requireAdmin(principal);
        adminService.DeleteUserWithAllData(id, actorId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/logs")
    public AdminContracts.LogsResponse getLogs(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @RequestParam(required = false) Integer lines
    ) {
        requireAdmin(principal);
        return adminService.GetLogs(lines);
    }

    private static UUID requireAdmin(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals(ADMIN_AUTHORITY));
        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return principal.getUserId();
    }

}
