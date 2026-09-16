package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.AttachmentContracts;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

public interface IAttachmentService {

    List<AttachmentContracts.AttachmentResponse> GetAttachmentsByNoteId(UUID noteId);

    AttachmentContracts.AttachmentResponse GetAttachmentById(UUID id);

    AttachmentContracts.AttachmentResponse UploadAttachment(
            UUID noteId,
            UUID createdById,
            String fileName,
            String contentType,
            long fileSize,
            InputStream content
    );

    AttachmentContracts.AttachmentDownloadResponse GetDownloadUrl(UUID id);

    void DeleteAttachmentById(UUID id);

}