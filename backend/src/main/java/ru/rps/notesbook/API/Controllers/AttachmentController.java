package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.AttachmentContracts;
import ru.rps.notesbook.API.Contracts.NoteContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.IAttachmentService;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AttachmentController {

    private final IAttachmentService attachmentService;
    private final INoteService noteService;

    @GetMapping("/api/notes/{noteId}/attachments")
    public List<AttachmentContracts.AttachmentResponse> listAttachments(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID noteId
    ) {
        UUID ownerId = requireUserId(principal);
        NoteContracts.NoteResponse note = noteService.GetNoteById(noteId);
        requireNoteOwnership(note, ownerId);

        return attachmentService.GetAttachmentsByNoteId(noteId);
    }

    @PostMapping("/api/notes/{noteId}/attachments")
    public AttachmentContracts.AttachmentResponse createAttachment(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID noteId,
            @RequestBody AttachmentContracts.CreateAttachmentRequest request
    ) {
        UUID ownerId = requireUserId(principal);
        NoteContracts.NoteResponse note = noteService.GetNoteById(noteId);
        requireNoteOwnership(note, ownerId);

        return attachmentService.CreateAttachment(noteId, ownerId, request);
    }

    @DeleteMapping("/api/attachments/{id}")
    public void deleteAttachment(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID ownerId = requireUserId(principal);
        AttachmentContracts.AttachmentResponse attachment = attachmentService.GetAttachmentById(id);
        NoteContracts.NoteResponse note = noteService.GetNoteById(attachment.noteId());
        requireNoteOwnership(note, ownerId);

        attachmentService.DeleteAttachmentById(id);
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

}