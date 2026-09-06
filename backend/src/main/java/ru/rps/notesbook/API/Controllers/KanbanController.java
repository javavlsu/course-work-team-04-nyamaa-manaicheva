package ru.rps.notesbook.API.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.KanbanContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.IKanbanService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.util.UUID;

@RestController
@RequestMapping("/api/kanban")
@RequiredArgsConstructor
public class KanbanController {

    private final IKanbanService kanbanService;

    // Boards

    @GetMapping("/board")
    public KanbanContracts.KanbanBoardResponse getMyBoard(
            @AuthenticationPrincipal NotesbookUserPrincipal principal
    ) {
        UUID userId = requireUserId(principal);
        return kanbanService.GetOrCreateBoardForUser(userId);
    }

    @GetMapping("/boards/{boardId}")
    public KanbanContracts.KanbanBoardResponse getBoardById(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID boardId
    ) {
        UUID userId = requireUserId(principal);
        return kanbanService.GetBoardById(userId, boardId);
    }

    // Columns

    @PostMapping("/boards/{boardId}/columns")
    public KanbanContracts.KanbanColumnResponse createColumn(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID boardId,
            @RequestBody KanbanContracts.CreateColumnRequest request
    ) {
        UUID userId = requireUserId(principal);
        return kanbanService.CreateColumn(userId, boardId, request);
    }

    @PutMapping("/columns/{columnId}")
    public KanbanContracts.KanbanColumnResponse updateColumn(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID columnId,
            @RequestBody KanbanContracts.UpdateColumnRequest request
    ) {
        UUID userId = requireUserId(principal);
        return kanbanService.UpdateColumn(userId, columnId, request);
    }

    @DeleteMapping("/columns/{columnId}")
    public void deleteColumn(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID columnId
    ) {
        UUID userId = requireUserId(principal);
        kanbanService.DeleteColumn(userId, columnId);
    }

    // Tasks

    @PostMapping("/columns/{columnId}/tasks")
    public KanbanContracts.KanbanTaskResponse createTask(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID columnId,
            @RequestBody KanbanContracts.CreateTaskRequest request
    ) {
        UUID userId = requireUserId(principal);
        return kanbanService.CreateTask(userId, columnId, request);
    }

    @PutMapping("/tasks/{taskId}")
    public KanbanContracts.KanbanTaskResponse updateTask(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID taskId,
            @RequestBody KanbanContracts.UpdateTaskRequest request
    ) {
        UUID userId = requireUserId(principal);
        return kanbanService.UpdateTask(userId, taskId, request);
    }

    @DeleteMapping("/tasks/{taskId}")
    public void deleteTask(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID taskId
    ) {
        UUID userId = requireUserId(principal);
        kanbanService.DeleteTask(userId, taskId);
    }

    @PatchMapping("/tasks/{taskId}/move")
    public KanbanContracts.KanbanTaskResponse moveTask(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID taskId,
            @RequestBody KanbanContracts.MoveTaskRequest request
    ) {
        UUID userId = requireUserId(principal);
        return kanbanService.MoveTask(userId, taskId, request);
    }

    @PatchMapping("/tasks/{taskId}/archive")
    public KanbanContracts.KanbanTaskResponse archiveTask(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID taskId
    ) {
        UUID userId = requireUserId(principal);
        return kanbanService.ArchiveTask(userId, taskId);
    }

    @PatchMapping("/tasks/{taskId}/unarchive")
    public KanbanContracts.KanbanTaskResponse unarchiveTask(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID taskId
    ) {
        UUID userId = requireUserId(principal);
        return kanbanService.UnarchiveTask(userId, taskId);
    }

    @PostMapping("/tasks/{taskId}/note/{noteId}")
    public KanbanContracts.KanbanTaskResponse linkNote(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID taskId,
            @PathVariable UUID noteId
    ) {
        UUID userId = requireUserId(principal);
        return kanbanService.LinkNoteToTask(userId, taskId, noteId);
    }

    @DeleteMapping("/tasks/{taskId}/note")
    public KanbanContracts.KanbanTaskResponse unlinkNote(
            @AuthenticationPrincipal NotesbookUserPrincipal principal,
            @PathVariable UUID taskId
    ) {
        UUID userId = requireUserId(principal);
        return kanbanService.UnlinkNoteFromTask(userId, taskId);
    }

    private static UUID requireUserId(NotesbookUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getUserId();
    }

}
