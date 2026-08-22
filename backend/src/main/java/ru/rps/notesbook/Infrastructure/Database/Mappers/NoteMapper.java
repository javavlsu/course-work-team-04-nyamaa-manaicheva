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
                entity.getUpdatedAt(),
                entity.getDeletedAt(),
                entity.getNoteType(),
                entity.isFavourite(),
                userMapper.ToDomain(entity.getOwner()),
                entity.getVersion()
        );
    }

    public NoteEntity ToEntity(Note note)
    {
        return new NoteEntity(
                note.GetId(),
                note.GetTitle(),
                note.GetContent(),
                note.GetCreateDate(),
                note.GetUpdatedAt(),
                note.GetDeletedAt(),
                note.GetNoteType(),
                note.GetIsFavourite(),
                userMapper.ToEntity(note.GetOwner()),
                note.GetVersion()
        );
    }
}