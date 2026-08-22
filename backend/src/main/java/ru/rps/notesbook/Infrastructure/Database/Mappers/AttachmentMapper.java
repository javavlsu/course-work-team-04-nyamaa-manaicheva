package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.Attachment;
import ru.rps.notesbook.Infrastructure.Database.Entities.AttachmentEntity;

@Component
@RequiredArgsConstructor
public class AttachmentMapper {

    private final NoteMapper noteMapper;
    private final UserMapper userMapper;

    public Attachment ToDomain(AttachmentEntity entity)
    {
        return new Attachment(
                entity.getId(),
                noteMapper.ToDomain(entity.getNote()),
                entity.getFileName(),
                entity.getContentType(),
                entity.getFileSize(),
                entity.getStorageKey(),
                entity.getCreatedAt(),
                userMapper.ToDomain(entity.getCreatedBy())
        );
    }

    public AttachmentEntity ToEntity(Attachment attachment)
    {
        return new AttachmentEntity(
                attachment.GetId(),
                noteMapper.ToEntity(attachment.GetNote()),
                attachment.GetFileName(),
                attachment.GetContentType(),
                attachment.GetFileSize(),
                attachment.GetStorageKey(),
                attachment.GetCreatedAt(),
                userMapper.ToEntity(attachment.GetCreatedBy())
        );
    }
}