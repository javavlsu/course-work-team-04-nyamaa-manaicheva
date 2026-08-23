package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.API.Contracts.TagContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.ITagRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.ITagService;
import ru.rps.notesbook.Domain.Models.Tag;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TagService implements ITagService {

    private final ITagRepository tagRepository;
    private final IUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TagContracts.TagResponse> GetTagsByOwnerId(UUID ownerId) {
        return tagRepository.GetTagsByOwnerId(ownerId).stream()
                .map(TagService::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TagContracts.TagResponse GetTagById(UUID id) {
        return toResponse(tagRepository.GetTagById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found")));
    }

    @Override
    @Transactional
    public TagContracts.TagResponse CreateTag(UUID ownerId, TagContracts.CreateTagRequest request) {
        User owner = userRepository.GetUserById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Tag tag = new Tag(
                UUID.randomUUID(),
                request.name(),
                owner,
                LocalDateTime.now()
        );

        return toResponse(tagRepository.SaveTag(tag));
    }

    @Override
    @Transactional
    public TagContracts.TagResponse UpdateTag(UUID id, TagContracts.UpdateTagRequest request) {
        Tag tag = tagRepository.GetTagById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found"));

        if (request.name() != null) {
            tag.ChangeName(request.name());
        }

        return toResponse(tagRepository.SaveTag(tag));
    }

    @Override
    @Transactional
    public void DeleteTagById(UUID id) {
        Tag tag = tagRepository.GetTagById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found"));

        tag.MarkDeleted();

        tagRepository.SaveTag(tag);
    }

    private static TagContracts.TagResponse toResponse(Tag t) {
        return new TagContracts.TagResponse(
                t.GetId(),
                t.GetName(),
                t.GetOwner().GetId(),
                t.GetCreatedAt()
        );
    }

}