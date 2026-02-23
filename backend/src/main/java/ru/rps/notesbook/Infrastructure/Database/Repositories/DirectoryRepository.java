package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Models.Directory;
import ru.rps.notesbook.Infrastructure.Database.Adapters.DirectoryAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.DirectoryMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class DirectoryRepository implements IDirectoryRepository {

    private final DirectoryAdapterJPA directoryAdapterJPA;
    private final DirectoryMapper directoryMapper;

    @Override
    public List<Directory> GetDirectoriesByOwnerId(UUID ownerId)
    {
        return directoryAdapterJPA.findDirectoriesByOwnerId(ownerId)
                .stream()
                .map(directoryMapper::ToDomain)
                .toList();
    }

    @Override
    public Optional<Directory> GetDirectoryById(UUID id)
    {
        return directoryAdapterJPA.findById(id)
                .map(directoryMapper::ToDomain);
    }

    @Override
    public Directory SaveDirectory(Directory directory)
    {
        DirectoryEntity entity = directoryMapper.ToEntity(directory);

        DirectoryEntity createdEntity = directoryAdapterJPA.save(entity);

        return directoryMapper.ToDomain(createdEntity);
    }

    @Override
    public void DeleteDirectoryById(UUID id)
    {
        directoryAdapterJPA.deleteById(id);
    }

}