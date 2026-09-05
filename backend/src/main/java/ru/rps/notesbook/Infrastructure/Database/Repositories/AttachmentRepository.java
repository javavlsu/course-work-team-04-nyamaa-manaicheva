package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.Domain.Interfaces.Repository.IAttachmentRepository;
import ru.rps.notesbook.Domain.Models.Attachment;
import ru.rps.notesbook.Infrastructure.Database.Adapters.AttachmentAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.AttachmentEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.AttachmentMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class AttachmentRepository implements IAttachmentRepository {

    private final AttachmentAdapterJPA attachmentAdapterJPA;
    private final AttachmentMapper attachmentMapper;

    @Override
    public List<Attachment> GetAttachmentsByNoteId(UUID noteId)
    {
        return attachmentAdapterJPA.findByNote_Id(noteId)
                .stream()
                .map(attachmentMapper::ToDomain)
                .toList();
    }

    @Override
    public Optional<Attachment> GetAttachmentById(UUID id)
    {
        return attachmentAdapterJPA.findById(id).map(attachmentMapper::ToDomain);
    }

    @Override
    @Transactional
    public Attachment SaveAttachment(Attachment attachment)
    {
        AttachmentEntity entity = attachmentMapper.ToEntity(attachment);

        AttachmentEntity createdEntity = attachmentAdapterJPA.save(entity);

        return attachmentMapper.ToDomain(createdEntity);
    }

    @Override
    public void DeleteAttachmentById(UUID id)
    {
        attachmentAdapterJPA.deleteById(id);
    }

    @Override
    public void DeleteAttachmentsByNoteId(UUID noteId)
    {
        attachmentAdapterJPA.deleteByNote_Id(noteId);
    }

}