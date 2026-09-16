package ru.rps.notesbook.API.Contracts;

import java.time.LocalDateTime;
import java.util.UUID;

public final class CommentContracts {

    public record CommentResponse(
            UUID id,
            UUID noteId,
            UUID authorId,
            String content,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    public record CreateCommentRequest(
        String content
    ) {}

    public record UpdateCommentRequest(
        String content
    ) {}

}