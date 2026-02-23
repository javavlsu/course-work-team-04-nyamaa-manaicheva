package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryNoteRepository;
import ru.rps.notesbook.Domain.Models.DirectoryNote;
import ru.rps.notesbook.Infrastructure.Database.Adapters.DirectoryNoteAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryNoteEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.DirectoryNoteMapper;

import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class DirectoryNoteRepository implements IDirectoryNoteRepository {

    private final DirectoryNoteAdapterJPA directoryNoteAdapterJPA;
    private final DirectoryNoteMapper directoryNoteMapper;

    @Override
    public List<DirectoryNote> GetDirectoriesNotesByDirectoryId(UUID directoryId)
    {
        return directoryNoteAdapterJPA.findByDirectoryId(directoryId)
                .stream()
                .map(directoryNoteMapper::ToDomain)
                .toList();
    }

    @Override
    public DirectoryNote SaveDirectoryNote(DirectoryNote directoryNote)
    {
        DirectoryNoteEntity entity = directoryNoteMapper.ToEntity(directoryNote);

        DirectoryNoteEntity createdEntity = directoryNoteAdapterJPA.save(entity);

        return directoryNoteMapper.ToDomain(createdEntity);
    }

    @Override
    public void DeleteDirectoryNoteByDirectoryId(UUID directoryId)
    {
        directoryNoteAdapterJPA.deleteByDirectoryId(directoryId);
    }

    @Override
    public void DeleteDirectoryNoteByNoteId(UUID noteId)
    {
        directoryNoteAdapterJPA.deleteByNoteId(noteId);
    }

}