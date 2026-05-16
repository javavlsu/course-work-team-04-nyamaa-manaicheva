package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.DirectoryContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/directories")
@RequiredArgsConstructor
public class DirectoryController {

    private final IDirectoryService directoryService;

    @GetMapping
    public List<DirectoryContracts.DirectoryResponse> getDirectories(
            @AuthenticationPrincipal NotesbookUserPrincipal principal
    ) {
        UUID ownerId = requireUserId(principal);
        return directoryService.GetDirectoriesByOwnerId(ownerId);
    }

    @GetMapping("/{id}")
    public DirectoryContracts.DirectoryResponse getDirectoryById(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        DirectoryContracts.DirectoryResponse response = directoryService.GetDirectoryById(id);
        requireOwnership(response, ownerId);
        return response;
    }

    @PostMapping
    public DirectoryContracts.DirectoryResponse createDirectory(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @RequestBody DirectoryContracts.CreateDirectoryRequest request
    ) {
        UUID ownerId = requireUserId(principal);
        return directoryService.CreateDirectory(ownerId, request);
    }

    @DeleteMapping("/{id}")
    public void deleteDirectoryById(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        DirectoryContracts.DirectoryResponse directory = directoryService.GetDirectoryById(id);
        requireOwnership(directory, ownerId);
        directoryService.DeleteDirectoryById(id);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
    }

    private static void requireOwnership(DirectoryContracts.DirectoryResponse response, UUID ownerId) {
        if (!response.ownerId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }
}