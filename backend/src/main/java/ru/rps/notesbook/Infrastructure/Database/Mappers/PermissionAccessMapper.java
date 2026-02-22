package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.PermissionAccess;
import ru.rps.notesbook.Infrastructure.Database.Entities.PermissionAccessEntity;

@Component
@RequiredArgsConstructor
public class PermissionAccessMapper {

    private final NoteMapper noteMapper;
    private final UserMapper userMapper;
    private final DirectoryMapper directoryMapper;

    public PermissionAccess ToDomain(PermissionAccessEntity entity)
    {
        return new PermissionAccess(
                entity.getId(),
                entity.getType(),
                noteMapper.ToDomain(entity.getNote()),
                userMapper.ToDomain(entity.getUserGranted()),
                directoryMapper.ToDomain(entity.getDirectory())
        );
    }

    public PermissionAccessEntity ToEntity(PermissionAccess permissionAccess)
    {
        return new PermissionAccessEntity(
                permissionAccess.GetId(),
                permissionAccess.GetAccessType(),
                noteMapper.ToEntity(permissionAccess.GetNote()),
                userMapper.ToEntity(permissionAccess.GetUser()),
                directoryMapper.ToEntity(permissionAccess.GetDirectory())
        );
    }
}