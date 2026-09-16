package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.NoteRevision;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteRevisionEntity;

@Component
@RequiredArgsConstructor
public class NoteRevisionMapper {

    private final NoteMapper noteMapper;
    private final UserMapper userMapper;

    public NoteRevision ToDomain(NoteRevisionEntity entity)
    {
        return new NoteRevision(
                entity.getId(),
                noteMapper.ToDomain(entity.getNote()),
                entity.getTitle(),
                entity.getContent(),
                entity.getVersion(),
                entity.getCreatedAt(),
                userMapper.ToDomain(entity.getCreatedBy())
        );
    }

    public NoteRevisionEntity ToEntity(NoteRevision noteRevision)
    {
        return new NoteRevisionEntity(
                noteRevision.GetId(),
                noteMapper.ToEntity(noteRevision.GetNote()),
                noteRevision.GetTitle(),
                noteRevision.GetContent(),
                noteRevision.GetVersion(),
                noteRevision.GetCreatedAt(),
                userMapper.ToEntity(noteRevision.GetCreatedBy())
        );
    }
    
}