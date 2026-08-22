package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRevisionRepository;
import ru.rps.notesbook.Domain.Models.NoteRevision;
import ru.rps.notesbook.Infrastructure.Database.Adapters.NoteRevisionAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteRevisionEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.NoteRevisionMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class NoteRevisionRepository implements INoteRevisionRepository {

    private final NoteRevisionAdapterJPA noteRevisionAdapterJPA;
    private final NoteRevisionMapper noteRevisionMapper;

    @Override
    public List<NoteRevision> GetRevisionsByNoteId(UUID noteId)
    {
        return noteRevisionAdapterJPA.findByNote_IdOrderByVersionDesc(noteId)
                .stream()
                .map(noteRevisionMapper::ToDomain)
                .toList();
    }

    @Override
    public Optional<NoteRevision> GetRevisionById(UUID id)
    {
        return noteRevisionAdapterJPA.findById(id).map(noteRevisionMapper::ToDomain);
    }

    @Override
    @Transactional
    public NoteRevision SaveRevision(NoteRevision revision)
    {
        NoteRevisionEntity entity = noteRevisionMapper.ToEntity(revision);

        NoteRevisionEntity createdEntity = noteRevisionAdapterJPA.save(entity);

        return noteRevisionMapper.ToDomain(createdEntity);
    }

    @Override
    public void DeleteRevisionById(UUID id)
    {
        noteRevisionAdapterJPA.deleteById(id);
    }

    @Override
    public void DeleteRevisionsByNoteId(UUID noteId)
    {
        noteRevisionAdapterJPA.deleteByNote_Id(noteId);
    }
}
