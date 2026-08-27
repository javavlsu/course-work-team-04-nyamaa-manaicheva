package ru.rps.notesbook.API.Contracts;

import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;

import java.time.LocalDateTime;
import java.util.UUID;

public final class NoteContracts {

    public record NoteResponse(
            UUID id,
            String title,
            Object content,
            LocalDateTime createDate,
            LocalDateTime updatedAt,
            LocalDateTime deletedAt,
            NoteTypeEnum noteType,
            boolean isFavourite,
            UUID ownerId,
            Long version
    ) {}

    public record NoteSummaryResponse(
            UUID id,
            String title,
            NoteTypeEnum noteType,
            boolean isFavourite
    ) {}

    public record CreateNoteRequest(
            String title,
            Object content,
            NoteTypeEnum noteType,
            boolean isFavourite
    ) {}

    // expectedVersion необязателен (null = старый клиент, проверка версии пропускается).
    // Если передан и отличается от текущей версии Note - сервер возвращает 409 Conflict.
    public record UpdateNoteRequest(
            String title,
            Object content,
            Long expectedVersion
    ) {}

}