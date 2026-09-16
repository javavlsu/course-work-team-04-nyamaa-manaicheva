package ru.rps.notesbook.API.Contracts;

import java.time.LocalDateTime;
import java.util.UUID;

public final class TagContracts {

    public record TagResponse(
            UUID id,
            String name,
            UUID ownerId,
            LocalDateTime createdAt
    ) {}

    public record CreateTagRequest(
        String name
    ) {}

    public record UpdateTagRequest(
        String name
    ) {}

}