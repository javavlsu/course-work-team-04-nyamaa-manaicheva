package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.API.Contracts.AttachmentContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.IAttachmentRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IAttachmentService;
import ru.rps.notesbook.Domain.Interfaces.Storage.IFileStorageService;
import ru.rps.notesbook.Domain.Models.Attachment;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.User;

import java.io.InputStream;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentService implements IAttachmentService {

    private static final Logger log = LoggerFactory.getLogger(AttachmentService.class);

    private static final Duration DOWNLOAD_URL_TTL = Duration.ofMinutes(15);

    private final IAttachmentRepository attachmentRepository;
    private final INoteRepository noteRepository;
    private final IUserRepository userRepository;
    private final IFileStorageService fileStorageService;

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
        return toResponse(getExisting(id));
    }

    @Override
    @Transactional
    public AttachmentContracts.AttachmentResponse UploadAttachment(
            UUID noteId,
            UUID createdById,
            String fileName,
            String contentType,
            long fileSize,
            InputStream content
    ) {
        Note note = noteRepository.GetNoteById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        User createdBy = userRepository.GetUserById(createdById)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String safeFileName = sanitizeFileName(fileName);
        UUID id = UUID.randomUUID();

        String storageKey = "attachments/" + noteId + "/" + id;

        fileStorageService.Upload(storageKey, content, fileSize, contentType);

        try {
            Attachment attachment = new Attachment(
                    id,
                    note,
                    safeFileName,
                    contentType,
                    fileSize,
                    storageKey,
                    LocalDateTime.now(),
                    createdBy
            );
            return toResponse(attachmentRepository.SaveAttachment(attachment));
        } catch (RuntimeException e) {
            safeDeleteFromStorage(storageKey);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AttachmentContracts.AttachmentDownloadResponse GetDownloadUrl(UUID id) {
        Attachment attachment = getExisting(id);
        String url = fileStorageService.GeneratePresignedDownloadUrl(attachment.GetStorageKey(), DOWNLOAD_URL_TTL);
        return new AttachmentContracts.AttachmentDownloadResponse(url, LocalDateTime.now().plus(DOWNLOAD_URL_TTL));
    }

    @Override
    @Transactional
    public void DeleteAttachmentById(UUID id) {
        Attachment attachment = getExisting(id);

        attachmentRepository.DeleteAttachmentById(id);

        try {
            fileStorageService.Delete(attachment.GetStorageKey());
        } catch (RuntimeException e) {
            log.error("Failed to delete storage object for attachment {} (key={}); metadata already removed",
                    id, attachment.GetStorageKey(), e);
        }
    }

    private Attachment getExisting(UUID id) {
        return attachmentRepository.GetAttachmentById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    private void safeDeleteFromStorage(String storageKey) {
        try {
            fileStorageService.Delete(storageKey);
        } catch (RuntimeException e) {
            log.error("Failed to clean up orphan storage object after metadata save failure (key={})", storageKey, e);
        }
    }

    private static String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("File name is required");
        }
        String base = Paths.get(fileName.trim()).getFileName().toString();
        if (base.isBlank() || base.equals(".") || base.equals("..")) {
            throw new IllegalArgumentException("Invalid file name");
        }
        return base;
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