package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.KanbanContracts;
import ru.rps.notesbook.Domain.Enum.KanbanTaskStatus;
import ru.rps.notesbook.Domain.Interfaces.Repository.IKanbanBoardRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IKanbanColumnRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IKanbanTaskRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IKanbanService;
import ru.rps.notesbook.Domain.Models.KanbanBoard;
import ru.rps.notesbook.Domain.Models.KanbanColumn;
import ru.rps.notesbook.Domain.Models.KanbanTask;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.ToIntFunction;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KanbanService implements IKanbanService {

    private final IKanbanBoardRepository kanbanBoardRepository;
    private final IKanbanColumnRepository kanbanColumnRepository;
    private final IKanbanTaskRepository kanbanTaskRepository;
    private final IUserRepository userRepository;
    private final INoteRepository noteRepository;

    // Board

    @Override
    @Transactional
    public KanbanContracts.KanbanBoardResponse GetOrCreateBoardForUser(UUID ownerId) {
        KanbanBoard board = kanbanBoardRepository.GetBoardByOwnerId(ownerId)
                .orElseGet(() -> {
                    User owner = userRepository.GetUserById(ownerId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

                    KanbanBoard newBoard = new KanbanBoard(UUID.randomUUID(), owner, LocalDateTime.now());

                    return kanbanBoardRepository.SaveBoard(newBoard);
                });

        return toBoardResponse(board);
    }

    @Override
    @Transactional(readOnly = true)
    public KanbanContracts.KanbanBoardResponse GetBoardById(UUID currentUserId, UUID boardId) {
        KanbanBoard board = getOwnedBoardOrThrow(currentUserId, boardId);

        return toBoardResponse(board);
    }

    // Columns

    @Override
    @Transactional
    public KanbanContracts.KanbanColumnResponse CreateColumn(UUID currentUserId, UUID boardId, KanbanContracts.CreateColumnRequest request) {
        KanbanBoard board = getOwnedBoardOrThrow(currentUserId, boardId);

        int position = request.position() != null
                ? request.position()
                : nextPosition(kanbanColumnRepository.GetColumnsByBoardId(boardId), KanbanColumn::GetPosition);

        KanbanColumn column = new KanbanColumn(
                UUID.randomUUID(),
                board,
                request.title(),
                position,
                LocalDateTime.now()
        );

        KanbanColumn saved = kanbanColumnRepository.SaveColumn(column);

        board.Touch();
        kanbanBoardRepository.SaveBoard(board);

        return toColumnResponse(saved);
    }

    @Override
    @Transactional
    public KanbanContracts.KanbanColumnResponse UpdateColumn(UUID currentUserId, UUID columnId, KanbanContracts.UpdateColumnRequest request) {
        KanbanColumn column = getOwnedColumnOrThrow(currentUserId, columnId);

        if (request.title() != null) {
            column.ChangeTitle(request.title());
        }
        if (request.position() != null) {
            column.ChangePosition(request.position());
        }

        return toColumnResponse(kanbanColumnRepository.SaveColumn(column));
    }

    @Override
    @Transactional
    public void DeleteColumn(UUID currentUserId, UUID columnId) {
        KanbanColumn column = getOwnedColumnOrThrow(currentUserId, columnId);

        // В схеме нет ON DELETE CASCADE (как и у остальных таблиц проекта) —
        // сначала удаляем задачи колонки, затем саму колонку.
        kanbanTaskRepository.DeleteTasksByColumnId(column.GetId());
        kanbanColumnRepository.DeleteColumnById(column.GetId());
    }

    // Tasks

    @Override
    @Transactional
    public KanbanContracts.KanbanTaskResponse CreateTask(UUID currentUserId, UUID columnId, KanbanContracts.CreateTaskRequest request) {
        KanbanColumn column = getOwnedColumnOrThrow(currentUserId, columnId);

        Note note = request.noteId() != null ? getOwnedNoteOrThrow(currentUserId, request.noteId()) : null;

        int position = request.position() != null
                ? request.position()
                : nextPosition(kanbanTaskRepository.GetTasksByColumnId(columnId), KanbanTask::GetPosition);

        KanbanTaskStatus status = request.status() != null ? request.status() : KanbanTaskStatus.Todo;

        KanbanTask task = new KanbanTask(
                UUID.randomUUID(),
                column,
                request.title(),
                request.description(),
                position,
                status,
                false,
                note,
                LocalDateTime.now()
        );

        return toTaskResponse(kanbanTaskRepository.SaveTask(task));
    }

    @Override
    @Transactional
    public KanbanContracts.KanbanTaskResponse UpdateTask(UUID currentUserId, UUID taskId, KanbanContracts.UpdateTaskRequest request) {
        KanbanTask task = getOwnedTaskOrThrow(currentUserId, taskId);

        if (request.title() != null) {
            task.ChangeTitle(request.title());
        }
        if (request.description() != null) {
            task.ChangeDescription(request.description());
        }
        if (request.status() != null) {
            task.ChangeStatus(request.status());
        }

        return toTaskResponse(kanbanTaskRepository.SaveTask(task));
    }

    @Override
    @Transactional
    public void DeleteTask(UUID currentUserId, UUID taskId) {
        KanbanTask task = getOwnedTaskOrThrow(currentUserId, taskId);

        kanbanTaskRepository.DeleteTaskById(task.GetId());
    }

    @Override
    @Transactional
    public KanbanContracts.KanbanTaskResponse MoveTask(UUID currentUserId, UUID taskId, KanbanContracts.MoveTaskRequest request) {
        KanbanTask task = getOwnedTaskOrThrow(currentUserId, taskId);

        KanbanColumn sourceColumn = task.GetColumn();
        KanbanColumn targetColumn = request.targetColumnId() != null
                ? getOwnedColumnOrThrow(currentUserId, request.targetColumnId())
                : sourceColumn;

        boolean columnChanged = !targetColumn.GetId().equals(sourceColumn.GetId());

        List<KanbanTask> targetSiblings = kanbanTaskRepository.GetTasksByColumnId(targetColumn.GetId()).stream()
                .filter(t -> !t.GetId().equals(task.GetId()))
                .sorted(Comparator.comparingInt(KanbanTask::GetPosition))
                .collect(Collectors.toCollection(ArrayList::new));

        int insertIndex = request.position() != null
                ? Math.max(0, Math.min(request.position(), targetSiblings.size()))
                : targetSiblings.size();

        targetSiblings.add(insertIndex, task);

        if (columnChanged) {
            task.MoveToColumn(targetColumn);
        }

        for (int i = 0; i < targetSiblings.size(); i++) {
            targetSiblings.get(i).ChangePosition(i);
        }
        targetSiblings.forEach(kanbanTaskRepository::SaveTask);

        if (columnChanged) {
            List<KanbanTask> sourceSiblings = kanbanTaskRepository.GetTasksByColumnId(sourceColumn.GetId()).stream()
                    .filter(t -> !t.GetId().equals(task.GetId()))
                    .sorted(Comparator.comparingInt(KanbanTask::GetPosition))
                    .toList();

            for (int i = 0; i < sourceSiblings.size(); i++) {
                sourceSiblings.get(i).ChangePosition(i);
            }
            sourceSiblings.forEach(kanbanTaskRepository::SaveTask);
        }

        return toTaskResponse(task);
    }

    @Override
    @Transactional
    public KanbanContracts.KanbanTaskResponse ArchiveTask(UUID currentUserId, UUID taskId) {
        KanbanTask task = getOwnedTaskOrThrow(currentUserId, taskId);

        task.Archive();

        return toTaskResponse(kanbanTaskRepository.SaveTask(task));
    }

    @Override
    @Transactional
    public KanbanContracts.KanbanTaskResponse UnarchiveTask(UUID currentUserId, UUID taskId) {
        KanbanTask task = getOwnedTaskOrThrow(currentUserId, taskId);

        task.Unarchive();

        return toTaskResponse(kanbanTaskRepository.SaveTask(task));
    }

    @Override
    @Transactional
    public KanbanContracts.KanbanTaskResponse LinkNoteToTask(UUID currentUserId, UUID taskId, UUID noteId) {
        KanbanTask task = getOwnedTaskOrThrow(currentUserId, taskId);
        Note note = getOwnedNoteOrThrow(currentUserId, noteId);

        task.LinkNote(note);

        return toTaskResponse(kanbanTaskRepository.SaveTask(task));
    }

    @Override
    @Transactional
    public KanbanContracts.KanbanTaskResponse UnlinkNoteFromTask(UUID currentUserId, UUID taskId) {
        KanbanTask task = getOwnedTaskOrThrow(currentUserId, taskId);

        task.UnlinkNote();

        return toTaskResponse(kanbanTaskRepository.SaveTask(task));
    }

    // Ownership helpers

    private KanbanBoard getOwnedBoardOrThrow(UUID currentUserId, UUID boardId) {
        KanbanBoard board = kanbanBoardRepository.GetBoardById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kanban board not found"));

        requireBoardOwner(currentUserId, board);

        return board;
    }

    private KanbanColumn getOwnedColumnOrThrow(UUID currentUserId, UUID columnId) {
        KanbanColumn column = kanbanColumnRepository.GetColumnById(columnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kanban column not found"));

        requireBoardOwner(currentUserId, column.GetBoard());

        return column;
    }

    private KanbanTask getOwnedTaskOrThrow(UUID currentUserId, UUID taskId) {
        KanbanTask task = kanbanTaskRepository.GetTaskById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kanban task not found"));

        requireBoardOwner(currentUserId, task.GetColumn().GetBoard());

        return task;
    }

    private Note getOwnedNoteOrThrow(UUID currentUserId, UUID noteId) {
        Note note = noteRepository.GetNoteById(noteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));

        if (!note.GetOwner().GetId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Нельзя привязать чужую заметку к задаче");
        }

        return note;
    }

    private void requireBoardOwner(UUID currentUserId, KanbanBoard board) {
        if (!board.GetOwner().GetId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Доступ к чужой Kanban-доске запрещён");
        }
    }

    // Mapping helpers

    private KanbanContracts.KanbanBoardResponse toBoardResponse(KanbanBoard board) {
        List<KanbanContracts.KanbanColumnResponse> columns = kanbanColumnRepository.GetColumnsByBoardId(board.GetId()).stream()
                .sorted(Comparator.comparingInt(KanbanColumn::GetPosition))
                .map(this::toColumnResponse)
                .toList();

        return new KanbanContracts.KanbanBoardResponse(
                board.GetId(),
                board.GetOwner().GetId(),
                board.GetCreatedAt(),
                board.GetUpdatedAt(),
                columns
        );
    }

    private KanbanContracts.KanbanColumnResponse toColumnResponse(KanbanColumn column) {
        List<KanbanContracts.KanbanTaskResponse> tasks = kanbanTaskRepository.GetTasksByColumnId(column.GetId()).stream()
                .sorted(Comparator.comparingInt(KanbanTask::GetPosition))
                .map(KanbanService::toTaskResponse)
                .toList();

        return new KanbanContracts.KanbanColumnResponse(
                column.GetId(),
                column.GetBoard().GetId(),
                column.GetTitle(),
                column.GetPosition(),
                column.GetCreatedAt(),
                column.GetUpdatedAt(),
                tasks
        );
    }

    private static KanbanContracts.KanbanTaskResponse toTaskResponse(KanbanTask task) {
        return new KanbanContracts.KanbanTaskResponse(
                task.GetId(),
                task.GetColumn().GetId(),
                task.GetTitle(),
                task.GetDescription(),
                task.GetPosition(),
                task.GetStatus(),
                task.IsArchived(),
                task.GetNote() != null ? task.GetNote().GetId() : null,
                task.GetCreatedAt(),
                task.GetUpdatedAt()
        );
    }

    private static <T> int nextPosition(List<T> items, ToIntFunction<T> positionGetter) {
        return items.stream().mapToInt(positionGetter).max().orElse(-1) + 1;
    }

}