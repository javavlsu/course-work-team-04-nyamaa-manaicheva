package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteEntity;

@Component
@RequiredArgsConstructor
public class NoteMapper {

    private final UserMapper userMapper;

    public Note ToDomain(NoteEntity entity)
    {
        return new Note(
                entity.getId(),
                entity.getTitle(),
                entity.getContent(),
                entity.getCreateDate(),
                entity.getNoteType(),
                entity.isFavourite(),
                userMapper.ToDomain(entity.getOwner())
        );
    }

    public NoteEntity ToEntity(Note note)
    {
        return new NoteEntity(
                note.GetId(),
                note.GetTitle(),
                note.GetContent(),
                note.GetCreateDate(),
                note.GetNoteType(),
                note.GetIsFavourite(),
                userMapper.ToEntity(note.GetOwner())
        );
    }
}
