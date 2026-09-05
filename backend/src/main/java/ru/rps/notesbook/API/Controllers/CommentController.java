package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.CommentContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.ICommentService;
import ru.rps.notesbook.Domain.Interfaces.Services.IPermissionAccessService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final ICommentService commentService;
    private final IPermissionAccessService permissionAccessService;

    @GetMapping("/api/notes/{noteId}/comments")
    public List<CommentContracts.CommentResponse> listComments(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID noteId
    ) {
        UUID userId = requireUserId(principal);
        requireCanViewNote(userId, noteId);

        return commentService.GetCommentsByNoteId(noteId);
    }

    @PostMapping("/api/notes/{noteId}/comments")
    public CommentContracts.CommentResponse createComment(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID noteId,
            @RequestBody CommentContracts.CreateCommentRequest request
    ) {
        UUID userId = requireUserId(principal);
        requireCanEditNote(userId, noteId);

        return commentService.CreateComment(noteId, userId, request);
    }

    @PutMapping("/api/comments/{id}")
    public CommentContracts.CommentResponse updateComment(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody CommentContracts.UpdateCommentRequest request
    ) {
        UUID userId = requireUserId(principal);
        CommentContracts.CommentResponse comment = commentService.GetCommentById(id);
        requireAuthorship(comment, userId);

        return commentService.UpdateComment(id, request);
    }

    @DeleteMapping("/api/comments/{id}")
    public void deleteComment(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID userId = requireUserId(principal);
        CommentContracts.CommentResponse comment = commentService.GetCommentById(id);
        requireAuthorship(comment, userId);

        commentService.DeleteCommentById(id);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
    }

    private static void requireAuthorship(CommentContracts.CommentResponse response, UUID userId) {
        if (!response.authorId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    private void requireCanViewNote(UUID userId, UUID noteId) {
        if (!permissionAccessService.canViewNote(userId, noteId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    private void requireCanEditNote(UUID userId, UUID noteId) {
        if (!permissionAccessService.canEditNote(userId, noteId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

}