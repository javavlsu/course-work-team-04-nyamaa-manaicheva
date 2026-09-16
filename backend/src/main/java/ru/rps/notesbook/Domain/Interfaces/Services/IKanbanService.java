package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.KanbanContracts;

import java.util.UUID;

public interface IKanbanService {

    KanbanContracts.KanbanBoardResponse GetOrCreateBoardForUser(UUID ownerId);

    KanbanContracts.KanbanBoardResponse GetBoardById(UUID currentUserId, UUID boardId);

    KanbanContracts.KanbanColumnResponse CreateColumn(UUID currentUserId, UUID boardId, KanbanContracts.CreateColumnRequest request);

    KanbanContracts.KanbanColumnResponse UpdateColumn(UUID currentUserId, UUID columnId, KanbanContracts.UpdateColumnRequest request);

    void DeleteColumn(UUID currentUserId, UUID columnId);

    KanbanContracts.KanbanTaskResponse CreateTask(UUID currentUserId, UUID columnId, KanbanContracts.CreateTaskRequest request);

    KanbanContracts.KanbanTaskResponse UpdateTask(UUID currentUserId, UUID taskId, KanbanContracts.UpdateTaskRequest request);

    void DeleteTask(UUID currentUserId, UUID taskId);

    KanbanContracts.KanbanTaskResponse MoveTask(UUID currentUserId, UUID taskId, KanbanContracts.MoveTaskRequest request);

    KanbanContracts.KanbanTaskResponse ArchiveTask(UUID currentUserId, UUID taskId);

    KanbanContracts.KanbanTaskResponse UnarchiveTask(UUID currentUserId, UUID taskId);

    KanbanContracts.KanbanTaskResponse LinkNoteToTask(UUID currentUserId, UUID taskId, UUID noteId);

    KanbanContracts.KanbanTaskResponse UnlinkNoteFromTask(UUID currentUserId, UUID taskId);

}
