package ru.rps.notesbook.API.Contracts;

import ru.rps.notesbook.Domain.Enum.KanbanTaskStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class KanbanContracts {

    public record KanbanBoardResponse(
            UUID id,
            UUID ownerId,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<KanbanColumnResponse> columns
    ) {}

    public record KanbanColumnResponse(
            UUID id,
            UUID boardId,
            String title,
            int position,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<KanbanTaskResponse> tasks
    ) {}

    public record KanbanTaskResponse(
            UUID id,
            UUID columnId,
            String title,
            String description,
            int position,
            KanbanTaskStatus status,
            boolean archived,
            UUID noteId,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    public record CreateColumnRequest(
            String title,
            Integer position
    ) {}

    public record UpdateColumnRequest(
            String title,
            Integer position
    ) {}

    public record CreateTaskRequest(
            String title,
            String description,
            Integer position,
            KanbanTaskStatus status,
            UUID noteId
    ) {}

    public record UpdateTaskRequest(
            String title,
            String description,
            KanbanTaskStatus status
    ) {}

    public record MoveTaskRequest(
            UUID targetColumnId,
            Integer position
    ) {}

}