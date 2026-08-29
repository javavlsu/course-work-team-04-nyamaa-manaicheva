package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.DirectoryContracts;
import ru.rps.notesbook.API.Contracts.DirectoryNoteContracts;
import ru.rps.notesbook.API.Contracts.NoteContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryNoteService;
import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryService;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteService;
import ru.rps.notesbook.Domain.Interfaces.Services.IPermissionAccessService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/directories")
@RequiredArgsConstructor
public class DirectoryController {

    private final IDirectoryService directoryService;
    private final INoteService noteService;
    private final IDirectoryNoteService directoryNoteService;
    private final IPermissionAccessService permissionAccessService;

    @GetMapping
    public DirectoryContracts.DirectoryPageResponse getDirectories(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String cursor
    ) {
        UUID ownerId = requireUserId(principal);
        return directoryService.GetDirectoriesByOwnerId(ownerId, search, limit, cursor);
    }

    @GetMapping("/{id}")
    public DirectoryContracts.DirectoryResponse getDirectoryById(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID userId = requireUserId(principal);
        requireCanViewDirectory(userId, id);
        return directoryService.GetDirectoryById(id);
    }

    @PostMapping
    public DirectoryContracts.DirectoryResponse createDirectory(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @RequestBody DirectoryContracts.CreateDirectoryRequest request
    ) {
        UUID ownerId = requireUserId(principal);
        return directoryService.CreateDirectory(ownerId, request);
    }

    @PutMapping("/{id}")
    public DirectoryContracts.DirectoryResponse updateDirectory(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody DirectoryContracts.UpdateDirectoryRequest request
    ) {
        UUID ownerId = requireUserId(principal);
        DirectoryContracts.DirectoryResponse directory = directoryService.GetDirectoryById(id);
        requireOwnership(directory, ownerId);

        return directoryService.UpdateDirectory(id, request);
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

    @GetMapping("/{id}/notes")
    public List<DirectoryNoteContracts.DirectoryNoteResponse> getNotesInDirectory(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID userId = requireUserId(principal);
        requireCanViewDirectory(userId, id);

        return directoryNoteService.GetNotesByDirectoryId(id);
    }

    @PostMapping("/{id}/notes/{noteId}")
    public DirectoryNoteContracts.DirectoryNoteResponse addNoteToDirectory(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id,
            @PathVariable UUID noteId
    ) {
        UUID ownerId = requireUserId(principal);
        DirectoryContracts.DirectoryResponse directory = directoryService.GetDirectoryById(id);
        requireOwnership(directory, ownerId);
        NoteContracts.NoteResponse note = noteService.GetNoteById(noteId);
        requireNoteOwnership(note, ownerId);

        return directoryNoteService.AddNoteToDirectory(
                new DirectoryNoteContracts.CreateDirectoryNoteRequest(noteId, id));
    }

    @DeleteMapping("/{id}/notes/{noteId}")
    public void removeNoteFromDirectory(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id,
            @PathVariable UUID noteId
    ) {
        UUID ownerId = requireUserId(principal);
        DirectoryContracts.DirectoryResponse directory = directoryService.GetDirectoryById(id);
        requireOwnership(directory, ownerId);

        directoryNoteService.RemoveNoteFromDirectory(id, noteId);
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

    private static void requireNoteOwnership(NoteContracts.NoteResponse response, UUID ownerId) {
        if (!response.ownerId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    private void requireCanViewDirectory(UUID userId, UUID directoryId) {
        if (!permissionAccessService.canViewDirectory(userId, directoryId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

}