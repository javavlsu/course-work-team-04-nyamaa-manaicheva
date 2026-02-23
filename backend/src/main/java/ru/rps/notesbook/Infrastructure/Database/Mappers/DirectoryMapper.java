package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.Directory;
import ru.rps.notesbook.Infrastructure.Database.Entities.DirectoryEntity;

@Component
@RequiredArgsConstructor
public class DirectoryMapper {

    private final UserMapper userMapper;

    public Directory ToDomain(DirectoryEntity entity)
    {
        return new Directory(
                entity.getId(),
                entity.getTitle(),
                userMapper.ToDomain(entity.getOwner())
        );
    }

    public DirectoryEntity ToEntity(Directory directory)
    {
        return new DirectoryEntity(
                directory.GetId(),
                directory.GetTitle(),
                directory.GetCreatedDate(),
                userMapper.ToEntity(directory.GetOwner())
        );
    }
}
