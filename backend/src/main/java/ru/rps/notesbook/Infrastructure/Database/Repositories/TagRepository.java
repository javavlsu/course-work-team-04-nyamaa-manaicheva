package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.Domain.Interfaces.Repository.ITagRepository;
import ru.rps.notesbook.Domain.Models.Tag;
import ru.rps.notesbook.Infrastructure.Database.Adapters.TagAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.TagEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.TagMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class TagRepository implements ITagRepository {

    private final TagAdapterJPA tagAdapterJPA;
    private final TagMapper tagMapper;

    @Override
    public List<Tag> GetTagsByOwnerId(UUID ownerId)
    {
        return tagAdapterJPA.findByOwner_IdAndDeletedAtIsNull(ownerId)
                .stream()
                .map(tagMapper::ToDomain)
                .toList();
    }

    @Override
    public Optional<Tag> GetTagById(UUID id)
    {
        return tagAdapterJPA.findByIdAndDeletedAtIsNull(id)
            .map(tagMapper::ToDomain);
    }

    @Override
    @Transactional
    public Tag SaveTag(Tag tag)
    {
        TagEntity entity = tagMapper.ToEntity(tag);

        TagEntity createdEntity = tagAdapterJPA.save(entity);

        return tagMapper.ToDomain(createdEntity);
    }

    @Override
    public void DeleteTagById(UUID id)
    {
        tagAdapterJPA.deleteById(id);
    }

}