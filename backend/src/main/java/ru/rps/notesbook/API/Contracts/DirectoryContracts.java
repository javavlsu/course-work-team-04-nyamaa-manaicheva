package ru.rps.notesbook.API.Contracts;

import java.time.LocalDateTime;
import java.util.UUID;

public final class DirectoryContracts {

    public record DirectoryResponse(
            UUID id,
            String title,
            LocalDateTime createdDate,
            UUID ownerId
    ) {}

    public record DirectorySummaryResponse(
            UUID id,
            String title
    ) {}

    public record CreateDirectoryRequest(String title) {}

    public record UpdateDirectoryRequest(
            String title
    ) {}
}

