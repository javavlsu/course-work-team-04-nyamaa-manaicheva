package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.AttachmentContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.IAttachmentService;
import ru.rps.notesbook.Domain.Interfaces.Services.IPermissionAccessService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AttachmentController {

    private static final long MAX_FILE_SIZE_BYTES = 20L * 1024 * 1024;

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

    @PostMapping(value = "/api/notes/{noteId}/attachments", consumes = "multipart/form-data")
    public AttachmentContracts.AttachmentResponse uploadAttachment(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID noteId,
            @RequestParam("file") MultipartFile file
    ) {
        UUID userId = requireUserId(principal);
        requireCanEditNote(userId, noteId);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required and can't be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "File exceeds 20 MB limit");
        }

        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        try {
            return attachmentService.UploadAttachment(
                    noteId, userId, file.getOriginalFilename(), contentType, file.getSize(), file.getInputStream()
            );
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to read uploaded file", e);
        }
    }

    @GetMapping("/api/attachments/{attachmentId}")
    public AttachmentContracts.AttachmentDownloadResponse downloadAttachment(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID attachmentId
    ) {
        UUID userId = requireUserId(principal);
        AttachmentContracts.AttachmentResponse attachment = attachmentService.GetAttachmentById(attachmentId);
        requireCanViewNote(userId, attachment.noteId());

        return attachmentService.GetDownloadUrl(attachmentId);
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