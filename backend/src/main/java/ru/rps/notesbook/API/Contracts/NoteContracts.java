package ru.rps.notesbook.API.Contracts;

import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;

import java.time.LocalDateTime;
import java.util.UUID;

public final class NoteContracts {

    public record NoteResponse(
            UUID id,
            String title,
            String content,
            LocalDateTime createDate,
            NoteTypeEnum noteType,
            boolean isFavourite,
            UUID ownerId
    ) {}

    public record NoteSummaryResponse(
            UUID id,
            String title,
            NoteTypeEnum noteType,
            boolean isFavourite
    ) {}

    public record CreateNoteRequest(
            String title,
            String content,
            NoteTypeEnum noteType,
            boolean isFavourite
    ) {}

    public record UpdateNoteRequest(
            String title,
            String content,
            Boolean isFavourite
    ) {}
}

