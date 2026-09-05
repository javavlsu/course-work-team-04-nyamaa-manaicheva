package ru.rps.notesbook.API.Contracts;

import java.time.LocalDateTime;
import java.util.UUID;

public final class AttachmentContracts {

    public record AttachmentResponse(
            UUID id,
            UUID noteId,
            String fileName,
            String contentType,
            Long fileSize,
            String storageKey,
            LocalDateTime createdAt,
            UUID createdById
    ) {}

    public record AttachmentDownloadResponse(
            String url,
            LocalDateTime expiresAt
    ) {}

}