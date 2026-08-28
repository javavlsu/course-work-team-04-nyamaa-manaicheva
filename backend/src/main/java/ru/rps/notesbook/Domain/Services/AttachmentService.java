package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.API.Contracts.AttachmentContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.IAttachmentRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IAttachmentService;
import ru.rps.notesbook.Domain.Models.Attachment;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentService implements IAttachmentService {

    private final IAttachmentRepository attachmentRepository;
    private final INoteRepository noteRepository;
    private final IUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AttachmentContracts.AttachmentResponse> GetAttachmentsByNoteId(UUID noteId) {
        return attachmentRepository.GetAttachmentsByNoteId(noteId).stream()
                .map(AttachmentService::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AttachmentContracts.AttachmentResponse GetAttachmentById(UUID id) {
        return toResponse(attachmentRepository.GetAttachmentById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found")));
    }

    @Override
    @Transactional
    public AttachmentContracts.AttachmentResponse CreateAttachment(
        UUID noteId, UUID createdById, AttachmentContracts.CreateAttachmentRequest request
    ) {
        Note note = noteRepository.GetNoteById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        User createdBy = userRepository.GetUserById(createdById)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Attachment attachment = new Attachment(
                UUID.randomUUID(),
                note,
                request.fileName(),
                request.contentType(),
                request.fileSize(),
                request.storageKey(),
                LocalDateTime.now(),
                createdBy
        );

        return toResponse(attachmentRepository.SaveAttachment(attachment));
    }

    @Override
    @Transactional
    public void DeleteAttachmentById(UUID id) {
        attachmentRepository.DeleteAttachmentById(id);
    }

    private static AttachmentContracts.AttachmentResponse toResponse(Attachment a) {
        return new AttachmentContracts.AttachmentResponse(
                a.GetId(),
                a.GetNote().GetId(),
                a.GetFileName(),
                a.GetContentType(),
                a.GetFileSize(),
                a.GetStorageKey(),
                a.GetCreatedAt(),
                a.GetCreatedBy().GetId()
        );
    }

}