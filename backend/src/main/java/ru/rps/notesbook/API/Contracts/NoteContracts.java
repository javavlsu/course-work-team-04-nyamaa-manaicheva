package ru.rps.notesbook.API.Contracts;

import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;

import java.time.LocalDateTime;
import java.util.List;
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

    // expectedVersion optional (not required)
    public record UpdateNoteRequest(
            String title,
            Object content,
            Long expectedVersion
    ) {}

    // Infinite Scroll: cursor-based pagination response. nextCursor == null и hasMore == false,
    // когда данных больше нет.
    public record NotePageResponse(
            List<NoteResponse> items,
            String nextCursor,
            boolean hasMore
    ) {}

}