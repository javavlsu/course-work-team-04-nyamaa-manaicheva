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
    public List<PermissionAccess> GetPermissionAccessesByUserIdAndDirectoryId(UUID userId, UUID directoryId)
    {
        return permissionAccessAdapterJPA.findByUserGranted_IdAndDirectory_Id(userId, directoryId)
                .stream()
                .map(permissionAccessMapper::ToDomain)
                .toList();
    }

    @Override
    public Optional<PermissionAccess> GetPermissionAccessByUserIdAndNoteId(UUID userId, UUID noteId)
    {
        return permissionAccessAdapterJPA.findByUserGranted_IdAndNote_Id(userId, noteId)
                .map(permissionAccessMapper::ToDomain);
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
}