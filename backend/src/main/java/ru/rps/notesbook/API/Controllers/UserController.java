package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.UserContracts;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Services.IUserService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private static final String ADMIN_AUTHORITY = "ROLE_" + RoleTypeEnum.Admin.name().toUpperCase();

    private final IUserService userService;

    @GetMapping
    public List<UserContracts.UserResponse> listUsers(@AuthenticationPrincipal NotesbookUserPrincipal principal)
    {
        requireUserId(principal);
        requireAdmin(principal);
        return userService.GetUsers();
    }

    @GetMapping("/search")
    public List<UserContracts.UserSearchResponse> searchUsers(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @RequestParam(name = "q", required = false) String q
    ) {
        requireUserId(principal);
        return userService.SearchUsers(q);
    }

    @GetMapping("/{id}")
    public UserContracts.UserResponse getUser(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        requireSelfOrAdmin(id, ownerId, principal);
        return userService.GetUserById(id);
    }

    @PutMapping("/{id}")
    public UserContracts.UserResponse updateUser(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody UserContracts.UpdateUserRequest request
    ) {
        UUID ownerId = requireUserId(principal);
        requireSelfOrAdmin(id, ownerId, principal);
        return userService.UpdateUser(id, request);
    }

    @PutMapping("/{id}/role")
    public UserContracts.UserResponse changeUserRole(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody UserContracts.ChangeRoleRequest request
    ) {
        requireUserId(principal);
        requireAdmin(principal);
        return userService.ChangeUserRole(id, request.role());
    }

    @DeleteMapping("/{id}")
    public void deleteUser(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        requireSelfOrAdmin(id, ownerId, principal);
        userService.DeleteUserById(id);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
    }

    private static boolean isAdmin(NotesbookUserPrincipal principal) {
        return principal.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals(ADMIN_AUTHORITY));
    }

    private static void requireAdmin(NotesbookUserPrincipal principal) {
        if (!isAdmin(principal)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    private static void requireSelfOrAdmin(UUID id, UUID ownerId, NotesbookUserPrincipal principal) {
        if (!id.equals(ownerId) && !isAdmin(principal)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

}