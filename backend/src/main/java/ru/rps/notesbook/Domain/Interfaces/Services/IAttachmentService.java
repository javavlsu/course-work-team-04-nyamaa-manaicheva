package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.AttachmentContracts;

import java.util.List;
import java.util.UUID;

public interface IAttachmentService {

    List<AttachmentContracts.AttachmentResponse> GetAttachmentsByNoteId(UUID noteId);

    AttachmentContracts.AttachmentResponse GetAttachmentById(UUID id);

    AttachmentContracts.AttachmentResponse CreateAttachment(UUID noteId, UUID createdById, AttachmentContracts.CreateAttachmentRequest request);

    void DeleteAttachmentById(UUID id);

}