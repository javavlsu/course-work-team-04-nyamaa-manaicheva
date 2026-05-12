package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.UserContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.IUserService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @GetMapping
    public List<UserContracts.UserResponse> listUsers(@AuthenticationPrincipal NotesbookUserPrincipal principal)
    {
        UUID ownerId = requireUserId(principal);
        return userService.GetUsers();
    }

    @GetMapping("/{id}")
    public UserContracts.UserResponse getUser(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        return userService.GetUserById(id);
    }

    @PostMapping("/{id}")
    public UserContracts.UserResponse updateUser(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody UserContracts.UpdateUserRequest request
    ) {
        UUID ownerId = requireUserId(principal);
        return userService.UpdateUser(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        userService.DeleteUserById(id);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
    }
}