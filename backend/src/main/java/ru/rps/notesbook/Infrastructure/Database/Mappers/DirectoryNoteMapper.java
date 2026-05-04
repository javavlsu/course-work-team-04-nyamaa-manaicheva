package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.DirectoryNote;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryEntity;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryNoteEntity;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryNoteId;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteEntity;

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
        NoteEntity note = noteMapper.ToEntity(directoryNote.GetNote());
        DirectoryEntity directory = directoryMapper.ToEntity(directoryNote.GetDirectory());
        return new DirectoryNoteEntity(
                new DirectoryNoteId(note.getId(), directory.getId()),
                note,
                directory
        );
    }
}