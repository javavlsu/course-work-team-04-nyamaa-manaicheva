package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.Attachment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IAttachmentRepository {
    List<Attachment> GetAttachmentsByNoteId(UUID noteId);
    Optional<Attachment> GetAttachmentById(UUID id);
    Attachment SaveAttachment(Attachment attachment);
    void DeleteAttachmentById(UUID id);
    void DeleteAttachmentsByNoteId(UUID noteId);
}