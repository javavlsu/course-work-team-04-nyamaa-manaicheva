package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.TagContracts;

import java.util.List;
import java.util.UUID;

public interface ITagService {

    List<TagContracts.TagResponse> GetTagsByOwnerId(UUID ownerId);

    TagContracts.TagResponse GetTagById(UUID id);

    TagContracts.TagResponse CreateTag(UUID ownerId, TagContracts.CreateTagRequest request);

    TagContracts.TagResponse UpdateTag(UUID id, TagContracts.UpdateTagRequest request);

    void DeleteTagById(UUID id);

}