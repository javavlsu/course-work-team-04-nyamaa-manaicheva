package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.DirectoryContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryService;
import ru.rps.notesbook.Domain.Models.Directory;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class DirectoryController {

    private final IDirectoryService directoryService;

    @GetMapping("/directories")
    public List<DirectoryContracts.DirectoryResponse> getDirectories(
            @AuthenticationPrincipal NotesbookUserPrincipal principal
    ) {
        UUID ownerId = requireUserId(principal);
        return directoryService.GetDirectoriesByOwnerId(ownerId).stream()
                .map(DirectoryController::toResponse)
                .toList();
    }

    @GetMapping("/directories/{id}")
    public DirectoryContracts.DirectoryResponse getDirectoryById(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        Directory directory = directoryService.GetDirectoryById(id);
        requireOwnership(directory, ownerId);
        return toResponse(directory);
    }

    @PostMapping("/directories")
    public DirectoryContracts.DirectoryResponse saveDirectory(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @RequestBody DirectoryContracts.CreateDirectoryRequest request
    ) {
        UUID ownerId = requireUserId(principal);
        Directory created = directoryService.CreateDirectoryForOwner(ownerId, request.title());
        return toResponse(created);
    }

    @DeleteMapping("/directories/{id}")
    public void deleteDirectoryById(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        Directory directory = directoryService.GetDirectoryById(id);
        requireOwnership(directory, ownerId);
        directoryService.DeleteDirectoryById(id);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
    }

    private static void requireOwnership(Directory directory, UUID ownerId) {
        if (!directory.GetOwner().GetId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    private static DirectoryContracts.DirectoryResponse toResponse(Directory d) {
        return new DirectoryContracts.DirectoryResponse(
                d.GetId(),
                d.GetTitle(),
                d.GetCreatedDate(),
                d.GetOwner().GetId()
        );
    }
}
