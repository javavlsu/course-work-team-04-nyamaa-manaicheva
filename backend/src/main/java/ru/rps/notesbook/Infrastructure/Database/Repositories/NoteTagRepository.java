package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteTagRepository;
import ru.rps.notesbook.Domain.Models.NoteTag;
import ru.rps.notesbook.Infrastructure.Database.Adapters.NoteTagAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteTagEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.NoteTagMapper;

import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class NoteTagRepository implements INoteTagRepository {

    private final NoteTagAdapterJPA noteTagAdapterJPA;
    private final NoteTagMapper noteTagMapper;

    @Override
    public List<NoteTag> GetNoteTagsByNoteId(UUID noteId)
    {
        return noteTagAdapterJPA.findByNote_Id(noteId)
                .stream()
                .map(noteTagMapper::ToDomain)
                .toList();
    }

    @Override
    @Transactional
    public NoteTag SaveNoteTag(NoteTag noteTag)
    {
        NoteTagEntity entity = noteTagMapper.ToEntity(noteTag);

        NoteTagEntity createdEntity = noteTagAdapterJPA.save(entity);

        return noteTagMapper.ToDomain(createdEntity);
    }

    @Override
    public void DeleteNoteTagByNoteId(UUID noteId)
    {
        noteTagAdapterJPA.deleteByNote_Id(noteId);
    }

    @Override
    public void DeleteNoteTagByTagId(UUID tagId)
    {
        noteTagAdapterJPA.deleteByTag_Id(tagId);
    }
}
