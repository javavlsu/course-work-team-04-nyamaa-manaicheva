package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IPermissionAccessRepository;
import ru.rps.notesbook.Domain.Models.PermissionAccess;
import ru.rps.notesbook.Infrastructure.Database.Adapters.PermissionAccessAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.PermissionAccessEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.PermissionAccessMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class PermissionAccessRepository implements IPermissionAccessRepository {

    private final PermissionAccessAdapterJPA permissionAccessAdapterJPA;
    private final PermissionAccessMapper permissionAccessMapper;

    @Override
    public Optional<PermissionAccess> GetPermissionAccessByUserIdAndNoteId(UUID userId, UUID noteId)
    {
        return permissionAccessAdapterJPA.findByUserGranted_IdAndNote_Id(userId, noteId)
                .map(permissionAccessMapper::ToDomain);
    }

    @Override
    public Optional<PermissionAccess> GetPermissionAccessByUserIdAndDirectoryId(UUID userId, UUID directoryId)
    {
        return permissionAccessAdapterJPA.findByUserGranted_IdAndDirectory_Id(userId, directoryId)
                .stream()
                .findFirst()
                .map(permissionAccessMapper::ToDomain);
    }

    @Override
    public List<PermissionAccess> GetPermissionAccessesByNoteId(UUID noteId)
    {
        return permissionAccessAdapterJPA.findByNote_Id(noteId)
                .stream()
                .map(permissionAccessMapper::ToDomain)
                .toList();
    }

    @Override
    public List<PermissionAccess> GetPermissionAccessesByDirectoryId(UUID directoryId)
    {
        return permissionAccessAdapterJPA.findByDirectory_Id(directoryId)
                .stream()
                .map(permissionAccessMapper::ToDomain)
                .toList();
    }

    @Override
    public List<PermissionAccess> GetPermissionAccessesByUserId(UUID userId)
    {
        return permissionAccessAdapterJPA.findByUserGranted_Id(userId)
                .stream()
                .map(permissionAccessMapper::ToDomain)
                .toList();
    }

    @Override
    public Optional<PermissionAccess> GetPermissionAccessById(UUID id)
    {
        return permissionAccessAdapterJPA.findById(id).map(permissionAccessMapper::ToDomain);
    }

    @Override
    public PermissionAccess SavePermissionAccess(PermissionAccess permissionAccess)
    {
        PermissionAccessEntity entity = permissionAccessMapper.ToEntity(permissionAccess);

        PermissionAccessEntity cratedEntity = permissionAccessAdapterJPA.save(entity);

        return permissionAccessMapper.ToDomain(cratedEntity);
    }

    @Override
    public void DeletePermissionAccessById(UUID id)
    {
        permissionAccessAdapterJPA.deleteById(id);
    }

    @Override
    public void DeletePermissionAccessByNoteId(UUID noteId)
    {
        permissionAccessAdapterJPA.deleteByNote_Id(noteId);
    }

    @Override
    public void DeletePermissionAccessByDirectoryId(UUID directoryId)
    {
        permissionAccessAdapterJPA.deleteByDirectory_Id(directoryId);
    }

}