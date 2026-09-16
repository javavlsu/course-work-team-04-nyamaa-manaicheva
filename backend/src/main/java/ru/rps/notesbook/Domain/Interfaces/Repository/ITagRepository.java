package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.Tag;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ITagRepository {

    List<Tag> GetTagsByOwnerId(UUID ownerId);
    Optional<Tag> GetTagById(UUID id);
    Tag SaveTag(Tag tag);
    void DeleteTagById(UUID id);
    
}