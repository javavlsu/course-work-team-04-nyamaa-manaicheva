package ru.rps.notesbook.API.Contracts;

import java.time.LocalDateTime;
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

    // expectedVersion необязателен (null = старый клиент, проверка версии пропускается).
    // Если передан и отличается от текущей версии Directory - сервер возвращает 409 Conflict.
    public record UpdateDirectoryRequest(
            String title,
            Long expectedVersion
    ) {}
}

