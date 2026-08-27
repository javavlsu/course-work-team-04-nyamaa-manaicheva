package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryNoteRepository;
import ru.rps.notesbook.Domain.Models.DirectoryNote;
import ru.rps.notesbook.Infrastructure.Database.Adapters.DirectoryNoteAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryNoteEntity;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryNoteId;
import ru.rps.notesbook.Infrastructure.Database.Mappers.DirectoryNoteMapper;

import java.time.LocalDateTime;
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
        return directoryNoteAdapterJPA.findByDirectory_Id(directoryId)
                .stream()
                .map(directoryNoteMapper::ToDomain)
                .toList();
    }

    @Override
    public List<DirectoryNote> GetDirectoriesNotesByNoteId(UUID noteId)
    {
        return directoryNoteAdapterJPA.findByNote_Id(noteId)
                .stream()
                .map(directoryNoteMapper::ToDomain)
                .toList();
    }

    @Override
    public boolean ExistsByNoteIdAndDirectoryId(UUID noteId, UUID directoryId)
    {
        return directoryNoteAdapterJPA.existsById(new DirectoryNoteId(noteId, directoryId));
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
        directoryNoteAdapterJPA.deleteByDirectory_Id(directoryId);
    }

    @Override
    public void DeleteDirectoryNoteByNoteId(UUID noteId)
    {
        directoryNoteAdapterJPA.deleteByNote_Id(noteId);
    }

    @Override
    public void DeleteDirectoryNoteByNoteIdAndDirectoryId(UUID noteId, UUID directoryId)
    {
        directoryNoteAdapterJPA.deleteById(new DirectoryNoteId(noteId, directoryId));
    }

    @Override
    public List<DirectoryNote> GetDirectoryNotesAddedAfter(LocalDateTime timestamp)
    {
        return directoryNoteAdapterJPA.findByAddedAtAfter(timestamp)
                .stream()
                .map(directoryNoteMapper::ToDomain)
                .toList();
    }

}