package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.DirectoryNote;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryNoteEntity;

@Component
@RequiredArgsConstructor
public class DirectoryNoteMapper {

    private final NoteMapper noteMapper;
    private final DirectoryMapper directoryMapper;

    public DirectoryNote ToDomain(DirectoryNoteEntity entity)
    {
        return new DirectoryNote(
                noteMapper.ToDomain(entity.getNote()),
                directoryMapper.ToDomain(entity.getDirectory())
        );
    }

    public DirectoryNoteEntity ToEntity(DirectoryNote directoryNote)
    {
        return new DirectoryNoteEntity(
                noteMapper.ToEntity(directoryNote.GetNote()),
                directoryMapper.ToEntity(directoryNote.GetDirectory())
        );
    }
}