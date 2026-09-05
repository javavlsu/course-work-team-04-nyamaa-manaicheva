package ru.rps.notesbook.API.Contracts;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class DirectoryContracts {

    public record DirectoryResponse(
            UUID id,
            String title,
            LocalDateTime createdDate,
            UUID ownerId,
            LocalDateTime updatedAt,
            LocalDateTime deletedAt,
            Long version
    ) {}

    public record DirectorySummaryResponse(
            UUID id,
            String title
    ) {}

    public record CreateDirectoryRequest(String title) {}

    // expectedVersion optional (not required)
    public record UpdateDirectoryRequest(
            String title,
            Long expectedVersion
    ) {}

    // Infinite Scroll: cursor-based pagination response. nextCursor == null и hasMore == false,
    // когда данных больше нет.
    public record DirectoryPageResponse(
            List<DirectoryResponse> items,
            String nextCursor,
            boolean hasMore
    ) {}

}