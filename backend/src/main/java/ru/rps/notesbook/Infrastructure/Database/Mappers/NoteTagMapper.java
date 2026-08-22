package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.NoteTag;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteEntity;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteTagEntity;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteTagId;
import ru.rps.notesbook.Infrastructure.Database.Entities.TagEntity;

@Component
@RequiredArgsConstructor
public class NoteTagMapper {

    private final NoteMapper noteMapper;
    private final TagMapper tagMapper;

    public NoteTag ToDomain(NoteTagEntity entity)
    {
        return new NoteTag(
                noteMapper.ToDomain(entity.getNote()),
                tagMapper.ToDomain(entity.getTag()),
                entity.getAddedAt()
        );
    }

    public NoteTagEntity ToEntity(NoteTag noteTag)
    {
        NoteEntity note = noteMapper.ToEntity(noteTag.GetNote());
        TagEntity tag = tagMapper.ToEntity(noteTag.GetTag());

        return new NoteTagEntity(
                new NoteTagId(note.getId(), tag.getId()),
                note,
                tag,
                noteTag.GetAddedAt()
        );
    }
}