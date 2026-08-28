package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.Tag;
import ru.rps.notesbook.Infrastructure.Database.Entities.TagEntity;

@Component
@RequiredArgsConstructor
public class TagMapper {

    private final UserMapper userMapper;

    public Tag ToDomain(TagEntity entity)
    {
        return new Tag(
                entity.getId(),
                entity.getName(),
                userMapper.ToDomain(entity.getOwner()),
                entity.getCreatedAt(),
                entity.getDeletedAt()
        );
    }

    public TagEntity ToEntity(Tag tag)
    {
        return new TagEntity(
                tag.GetId(),
                tag.GetName(),
                userMapper.ToEntity(tag.GetOwner()),
                tag.GetCreatedAt(),
                tag.GetDeletedAt()
        );
    }
    
}