package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.NoteContracts;
import ru.rps.notesbook.API.Contracts.NoteRevisionContracts;
import ru.rps.notesbook.API.Contracts.NoteTagContracts;
import ru.rps.notesbook.API.Contracts.TagContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteRevisionService;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteService;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteTagService;
import ru.rps.notesbook.Domain.Interfaces.Services.ITagService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final INoteService noteService;
    private final INoteRevisionService noteRevisionService;
    private final INoteTagService noteTagService;
    private final ITagService tagService;

    // Note

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
        return noteService.CreateNote(ownerId, request);
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

    @PatchMapping("/{id}/favourite")
    public NoteContracts.NoteResponse favouriteChangeNote(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        NoteContracts.NoteResponse response = noteService.GetNoteById(id);
        requireOwnership(response, ownerId);

        return noteService.favouriteChangeNote(id);
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

    // NoteRevision

    @GetMapping("/{id}/revisions")
    public List<NoteRevisionContracts.NoteRevisionResponse> listRevisions(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        NoteContracts.NoteResponse note = noteService.GetNoteById(id);
        requireOwnership(note, ownerId);

        return noteRevisionService.GetRevisionsByNoteId(id);
    }

    @GetMapping("/{id}/revisions/{revisionId}")
    public NoteRevisionContracts.NoteRevisionResponse getRevision(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id,
            @PathVariable UUID revisionId
    ) {
        UUID ownerId = requireUserId(principal);
        NoteContracts.NoteResponse note = noteService.GetNoteById(id);
        requireOwnership(note, ownerId);

        NoteRevisionContracts.NoteRevisionResponse revision = noteRevisionService.GetRevisionById(revisionId);
        if (!revision.noteId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return revision;
    }

    // NoteTag

    @GetMapping("/{id}/tags")
    public List<NoteTagContracts.NoteTagResponse> listTags(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        NoteContracts.NoteResponse note = noteService.GetNoteById(id);
        requireOwnership(note, ownerId);

        return noteTagService.GetTagsByNoteId(id);
    }

    @PostMapping("/{id}/tags/{tagId}")
    public NoteTagContracts.NoteTagResponse addTag(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id,
            @PathVariable UUID tagId
    ) {
        UUID ownerId = requireUserId(principal);
        NoteContracts.NoteResponse note = noteService.GetNoteById(id);
        requireOwnership(note, ownerId);
        requireTagOwnership(tagService.GetTagById(tagId), ownerId);

        return noteTagService.AddTagToNote(new NoteTagContracts.CreateNoteTagRequest(id, tagId));
    }

    @DeleteMapping("/{id}/tags/{tagId}")
    public void removeTag(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id,
            @PathVariable UUID tagId
    ) {
        UUID ownerId = requireUserId(principal);
        NoteContracts.NoteResponse note = noteService.GetNoteById(id);
        requireOwnership(note, ownerId);

        noteTagService.RemoveTagFromNote(id, tagId);
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

    private static void requireTagOwnership(TagContracts.TagResponse response, UUID ownerId) {
        if (!response.ownerId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

}