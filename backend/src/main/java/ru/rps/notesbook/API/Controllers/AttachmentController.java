package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.AttachmentContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.IAttachmentService;
import ru.rps.notesbook.Domain.Interfaces.Services.IPermissionAccessService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AttachmentController {

    private final IAttachmentService attachmentService;
    private final IPermissionAccessService permissionAccessService;

    @GetMapping("/api/notes/{noteId}/attachments")
    public List<AttachmentContracts.AttachmentResponse> listAttachments(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID noteId
    ) {
        UUID userId = requireUserId(principal);
        requireCanViewNote(userId, noteId);

        return attachmentService.GetAttachmentsByNoteId(noteId);
    }

    @PostMapping("/api/notes/{noteId}/attachments")
    public AttachmentContracts.AttachmentResponse createAttachment(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID noteId,
            @RequestBody AttachmentContracts.CreateAttachmentRequest request
    ) {
        UUID userId = requireUserId(principal);
        requireCanEditNote(userId, noteId);

        return attachmentService.CreateAttachment(noteId, userId, request);
    }

    @DeleteMapping("/api/attachments/{id}")
    public void deleteAttachment(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID id
    ) {
        UUID userId = requireUserId(principal);
        AttachmentContracts.AttachmentResponse attachment = attachmentService.GetAttachmentById(id);
        requireCanEditNote(userId, attachment.noteId());

        attachmentService.DeleteAttachmentById(id);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
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