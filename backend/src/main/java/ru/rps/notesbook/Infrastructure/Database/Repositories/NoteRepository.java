package ru.rps.notesbook.Infrastructure.Database.Repositories;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Infrastructure.Database.Adapters.NoteAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.NoteMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class NoteRepository implements INoteRepository {

    private final NoteAdapterJPA noteAdapterJPA;
    private final NoteMapper noteMapper;

    @Override
    public List<Note> GetNotesByUserId(UUID ownerId)
    {
        return noteAdapterJPA.findByOwner_Id(ownerId)
                .stream()
                .map(noteMapper::ToDomain)
                .toList();
    }

    @Override
    public Optional<Note> GetNoteById(UUID id)
    {
        return noteAdapterJPA.findById(id).map(noteMapper::ToDomain);
    }

    @Override
    @Transactional
    public Note SaveNote(Note note) {
        NoteEntity entity = noteMapper.ToEntity(note);

        NoteEntity createdEntity = noteAdapterJPA.save(entity);

        return  noteMapper.ToDomain(createdEntity);
    }

    @Override
    public void DeleteNoteById(UUID id)
    {
        noteAdapterJPA.deleteById(id);
    }

}