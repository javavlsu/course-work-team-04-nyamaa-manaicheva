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
                entity.getNote() != null ? noteMapper.ToDomain(entity.getNote()) : null,
                userMapper.ToDomain(entity.getUserGranted()),
                entity.getDirectory() != null ? directoryMapper.ToDomain(entity.getDirectory()) : null,
                userMapper.ToDomain(entity.getCreatedBy()),
                entity.getCreatedAt()
        );
    }

    public PermissionAccessEntity ToEntity(PermissionAccess permissionAccess)
    {
        return new PermissionAccessEntity(
                permissionAccess.GetId(),
                permissionAccess.GetAccessType(),
                permissionAccess.GetNote() != null ? noteMapper.ToEntity(permissionAccess.GetNote()) : null,
                permissionAccess.GetDirectory() != null ? directoryMapper.ToEntity(permissionAccess.GetDirectory()) : null,
                userMapper.ToEntity(permissionAccess.GetUser()),
                userMapper.ToEntity(permissionAccess.GetCreatedBy()),
                permissionAccess.GetCreatedAt()
        );
    }
    
}