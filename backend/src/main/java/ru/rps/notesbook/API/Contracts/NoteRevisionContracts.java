package ru.rps.notesbook.API.Contracts;

import java.time.LocalDateTime;
import java.util.UUID;

public final class NoteRevisionContracts {

    public record NoteRevisionResponse(
            UUID id,
            UUID noteId,
            String title,
            Object content,
            Long version,
            LocalDateTime createdAt,
            UUID createdById
    ) {}

}