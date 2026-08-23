package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.CommentContracts;
import ru.rps.notesbook.API.Contracts.NoteContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.ICommentService;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final ICommentService commentService;
    private final INoteService noteService;

    @GetMapping("/api/notes/{noteId}/comments")
    public List<CommentContracts.CommentResponse> listComments(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID noteId
    ) {
        UUID ownerId = requireUserId(principal);
        NoteContracts.NoteResponse note = noteService.GetNoteById(noteId);
        requireNoteOwnership(note, ownerId);

        return commentService.GetCommentsByNoteId(noteId);
    }

    @PostMapping("/api/notes/{noteId}/comments")
    public CommentContracts.CommentResponse createComment(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID noteId,
            @RequestBody CommentContracts.CreateCommentRequest request
    ) {
        UUID ownerId = requireUserId(principal);
        NoteContracts.NoteResponse note = noteService.GetNoteById(noteId);
        requireNoteOwnership(note, ownerId);

        return commentService.CreateComment(noteId, ownerId, request);
    }

    @PutMapping("/api/comments/{id}")
    public CommentContracts.CommentResponse updateComment(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody CommentContracts.UpdateCommentRequest request
    ) {
        UUID ownerId = requireUserId(principal);
        CommentContracts.CommentResponse comment = commentService.GetCommentById(id);
        requireAuthorship(comment, ownerId);

        return commentService.UpdateComment(id, request);
    }

    @DeleteMapping("/api/comments/{id}")
    public void deleteComment(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        CommentContracts.CommentResponse comment = commentService.GetCommentById(id);
        requireAuthorship(comment, ownerId);

        commentService.DeleteCommentById(id);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
    }

    private static void requireNoteOwnership(NoteContracts.NoteResponse response, UUID ownerId) {
        if (!response.ownerId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    private static void requireAuthorship(CommentContracts.CommentResponse response, UUID ownerId) {
        if (!response.authorId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

}