package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.NoteContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final INoteService noteService;

    @GetMapping
    public List<NoteContracts.NoteResponse> listNotes(@AuthenticationPrincipal NotesbookUserPrincipal principal) {
        UUID ownerId = requireUserId(principal);
        return noteService.GetNotesByOwnerId(ownerId);
    }

    @GetMapping("/{id}")
    public NoteContracts.NoteResponse getNote(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        NoteContracts.NoteResponse response = noteService.GetNoteById(id);
        requireOwnership(response, ownerId);
        return response;
    }

    @PostMapping
    public NoteContracts.NoteResponse createNote(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @RequestBody NoteContracts.CreateNoteRequest request
    ) {
        UUID ownerId = requireUserId(principal);
        return noteService.CreateNote(
                ownerId,
                request.title(),
                request.content(),
                request.noteType(),
                request.isFavourite()
        );
    }

    @PutMapping("/{id}")
    public NoteContracts.NoteResponse updateNote(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody NoteContracts.UpdateNoteRequest request
    ) {
        UUID ownerId = requireUserId(principal);
        NoteContracts.NoteResponse response = noteService.GetNoteById(id);
        requireOwnership(response, ownerId);

        return noteService.UpdateNote(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteNote(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        NoteContracts.NoteResponse response = noteService.GetNoteById(id);
        requireOwnership(response, ownerId);

        noteService.DeleteNoteById(id);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
    }

    private static void requireOwnership(NoteContracts.NoteResponse response, UUID ownerId) {
        if (!response.ownerId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }
}
