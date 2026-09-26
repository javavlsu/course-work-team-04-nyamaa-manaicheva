package ru.rps.notesbook.Domain.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.KanbanContracts;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IKanbanBoardRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IKanbanColumnRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IKanbanTaskRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Models.KanbanBoard;
import ru.rps.notesbook.Domain.Models.KanbanColumn;
import ru.rps.notesbook.Domain.Models.KanbanTask;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KanbanServiceTest {

    @Mock
    private IKanbanBoardRepository kanbanBoardRepository;
    @Mock
    private IKanbanColumnRepository kanbanColumnRepository;
    @Mock
    private IKanbanTaskRepository kanbanTaskRepository;
    @Mock
    private IUserRepository userRepository;
    @Mock
    private INoteRepository noteRepository;

    private KanbanService kanbanService;

    private User owner;
    private UUID ownerId;
    private User otherUser;

    @BeforeEach
    void setUp() {
        kanbanService = new KanbanService(
                kanbanBoardRepository, kanbanColumnRepository, kanbanTaskRepository, userRepository, noteRepository);

        ownerId = UUID.randomUUID();
        owner = new User(ownerId, "Иван", "Иванов", "ivan@example.com",
                LocalDate.of(1995, 1, 1), LocalDateTime.now(), "hash", RoleTypeEnum.Client);

        otherUser = new User(UUID.randomUUID(), "Пётр", "Петров", "petr@example.com",
                LocalDate.of(1996, 2, 2), LocalDateTime.now(), "hash", RoleTypeEnum.Client);
    }

    @Test
    void getOrCreateBoardForUser_whenNoneExists_shouldCreateNewBoard() {
        when(kanbanBoardRepository.GetBoardByOwnerId(ownerId)).thenReturn(Optional.empty());
        when(userRepository.GetUserById(ownerId)).thenReturn(Optional.of(owner));
        when(kanbanBoardRepository.SaveBoard(any(KanbanBoard.class))).thenAnswer(inv -> inv.getArgument(0));

        KanbanContracts.KanbanBoardResponse response = kanbanService.GetOrCreateBoardForUser(ownerId);

        assertNotNull(response.id());
        assertEquals(ownerId, response.ownerId());
        assertTrue(response.columns().isEmpty());
        verify(kanbanBoardRepository, times(1)).SaveBoard(any(KanbanBoard.class));
    }

    @Test
    void createColumn_onOwnBoard_shouldCreateColumnWithGivenPosition() {
        UUID boardId = UUID.randomUUID();
        KanbanBoard board = new KanbanBoard(boardId, owner, LocalDateTime.now());
        when(kanbanBoardRepository.GetBoardById(boardId)).thenReturn(Optional.of(board));
        when(kanbanColumnRepository.SaveColumn(any(KanbanColumn.class))).thenAnswer(inv -> inv.getArgument(0));
        when(kanbanBoardRepository.SaveBoard(any(KanbanBoard.class))).thenAnswer(inv -> inv.getArgument(0));

        KanbanContracts.CreateColumnRequest request = new KanbanContracts.CreateColumnRequest("Сделать", 0);

        KanbanContracts.KanbanColumnResponse response = kanbanService.CreateColumn(ownerId, boardId, request);

        assertEquals("Сделать", response.title());
        assertEquals(0, response.position());
        assertEquals(boardId, response.boardId());
        verify(kanbanBoardRepository, times(1)).SaveBoard(board);
    }

    @Test
    void createTask_inColumnOfForeignBoard_shouldThrowForbidden() {
        UUID boardId = UUID.randomUUID();
        UUID columnId = UUID.randomUUID();
        KanbanBoard foreignBoard = new KanbanBoard(boardId, otherUser, LocalDateTime.now());
        KanbanColumn column = new KanbanColumn(columnId, foreignBoard, "В работе", 0, LocalDateTime.now());
        when(kanbanColumnRepository.GetColumnById(columnId)).thenReturn(Optional.of(column));

        KanbanContracts.CreateTaskRequest request = new KanbanContracts.CreateTaskRequest("Задача", null, null, null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> kanbanService.CreateTask(ownerId, columnId, request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(kanbanTaskRepository, never()).SaveTask(any());
    }

    @Test
    void moveTask_betweenColumns_shouldRecalculatePositionsInBothColumns() {
        UUID boardId = UUID.randomUUID();
        KanbanBoard board = new KanbanBoard(boardId, owner, LocalDateTime.now());
        UUID sourceColumnId = UUID.randomUUID();
        UUID targetColumnId = UUID.randomUUID();
        KanbanColumn sourceColumn = new KanbanColumn(sourceColumnId, board, "Сделать", 0, LocalDateTime.now());
        KanbanColumn targetColumn = new KanbanColumn(targetColumnId, board, "В работе", 1, LocalDateTime.now());

        UUID taskId = UUID.randomUUID();
        KanbanTask task = new KanbanTask(taskId, sourceColumn, "Задача", null, 0, false, null, LocalDateTime.now());
        KanbanTask existingInTarget = new KanbanTask(
                UUID.randomUUID(), targetColumn, "Уже там", null, 0, false, null, LocalDateTime.now());

        when(kanbanTaskRepository.GetTaskById(taskId)).thenReturn(Optional.of(task));
        when(kanbanColumnRepository.GetColumnById(targetColumnId)).thenReturn(Optional.of(targetColumn));
        when(kanbanTaskRepository.GetTasksByColumnId(targetColumnId)).thenReturn(List.of(existingInTarget));
        when(kanbanTaskRepository.GetTasksByColumnId(sourceColumnId)).thenReturn(List.of());
        when(kanbanTaskRepository.SaveTask(any(KanbanTask.class))).thenAnswer(inv -> inv.getArgument(0));

        KanbanContracts.MoveTaskRequest request = new KanbanContracts.MoveTaskRequest(targetColumnId, 0);

        KanbanContracts.KanbanTaskResponse response = kanbanService.MoveTask(ownerId, taskId, request);

        assertEquals(targetColumnId, response.columnId());
        assertEquals(0, response.position());
        assertEquals(1, existingInTarget.GetPosition());
    }

    @Test
    void moveTask_toColumnOfForeignBoard_shouldThrowForbidden() {
        UUID boardId = UUID.randomUUID();
        KanbanBoard board = new KanbanBoard(boardId, owner, LocalDateTime.now());
        UUID sourceColumnId = UUID.randomUUID();
        KanbanColumn sourceColumn = new KanbanColumn(sourceColumnId, board, "Сделать", 0, LocalDateTime.now());

        UUID taskId = UUID.randomUUID();
        KanbanTask task = new KanbanTask(taskId, sourceColumn, "Задача", null, 0, false, null, LocalDateTime.now());
        when(kanbanTaskRepository.GetTaskById(taskId)).thenReturn(Optional.of(task));

        UUID foreignBoardId = UUID.randomUUID();
        KanbanBoard foreignBoard = new KanbanBoard(foreignBoardId, otherUser, LocalDateTime.now());
        UUID foreignColumnId = UUID.randomUUID();
        KanbanColumn foreignColumn = new KanbanColumn(foreignColumnId, foreignBoard, "Чужая", 0, LocalDateTime.now());
        when(kanbanColumnRepository.GetColumnById(foreignColumnId)).thenReturn(Optional.of(foreignColumn));

        KanbanContracts.MoveTaskRequest request = new KanbanContracts.MoveTaskRequest(foreignColumnId, 0);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> kanbanService.MoveTask(ownerId, taskId, request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(kanbanTaskRepository, never()).SaveTask(any());
    }

    @Test
    void moveTask_withPositionBeyondListBounds_shouldClampToEndOfColumn() {
        UUID boardId = UUID.randomUUID();
        KanbanBoard board = new KanbanBoard(boardId, owner, LocalDateTime.now());
        UUID columnId = UUID.randomUUID();
        KanbanColumn column = new KanbanColumn(columnId, board, "Сделать", 0, LocalDateTime.now());

        UUID taskId = UUID.randomUUID();
        KanbanTask task = new KanbanTask(taskId, column, "Задача", null, 2, false, null, LocalDateTime.now());
        KanbanTask sibling1 = new KanbanTask(UUID.randomUUID(), column, "Первая", null, 0, false, null, LocalDateTime.now());
        KanbanTask sibling2 = new KanbanTask(UUID.randomUUID(), column, "Вторая", null, 1, false, null, LocalDateTime.now());

        when(kanbanTaskRepository.GetTaskById(taskId)).thenReturn(Optional.of(task));
        when(kanbanTaskRepository.GetTasksByColumnId(columnId)).thenReturn(List.of(sibling1, sibling2, task));
        when(kanbanTaskRepository.SaveTask(any(KanbanTask.class))).thenAnswer(inv -> inv.getArgument(0));

        KanbanContracts.MoveTaskRequest request = new KanbanContracts.MoveTaskRequest(null, 999);

        KanbanContracts.KanbanTaskResponse response = kanbanService.MoveTask(ownerId, taskId, request);

        assertEquals(2, response.position());
        assertEquals(0, sibling1.GetPosition());
        assertEquals(1, sibling2.GetPosition());
    }

    @Test
    void archiveAndUnarchiveTask_shouldToggleArchivedFlag() {
        UUID boardId = UUID.randomUUID();
        KanbanBoard board = new KanbanBoard(boardId, owner, LocalDateTime.now());
        UUID columnId = UUID.randomUUID();
        KanbanColumn column = new KanbanColumn(columnId, board, "Сделать", 0, LocalDateTime.now());
        UUID taskId = UUID.randomUUID();
        KanbanTask task = new KanbanTask(taskId, column, "Задача", null, 0, false, null, LocalDateTime.now());

        when(kanbanTaskRepository.GetTaskById(taskId)).thenReturn(Optional.of(task));
        when(kanbanTaskRepository.SaveTask(any(KanbanTask.class))).thenAnswer(inv -> inv.getArgument(0));

        KanbanContracts.KanbanTaskResponse archived = kanbanService.ArchiveTask(ownerId, taskId);
        assertTrue(archived.archived());

        KanbanContracts.KanbanTaskResponse unarchived = kanbanService.UnarchiveTask(ownerId, taskId);
        assertFalse(unarchived.archived());
    }

    @Test
    void deleteTask_whenAlreadyArchived_shouldDeleteRegardlessOfArchivedStatus() {
        UUID boardId = UUID.randomUUID();
        KanbanBoard board = new KanbanBoard(boardId, owner, LocalDateTime.now());
        UUID columnId = UUID.randomUUID();
        KanbanColumn column = new KanbanColumn(columnId, board, "Сделать", 0, LocalDateTime.now());
        UUID taskId = UUID.randomUUID();
        KanbanTask archivedTask = new KanbanTask(taskId, column, "Задача", null, 0, true, null, LocalDateTime.now());

        when(kanbanTaskRepository.GetTaskById(taskId)).thenReturn(Optional.of(archivedTask));

        kanbanService.DeleteTask(ownerId, taskId);

        verify(kanbanTaskRepository, times(1)).DeleteTaskById(taskId);
    }

    @Test
    void linkNoteToTask_withForeignNote_shouldThrowForbidden() {
        UUID boardId = UUID.randomUUID();
        KanbanBoard board = new KanbanBoard(boardId, owner, LocalDateTime.now());
        UUID columnId = UUID.randomUUID();
        KanbanColumn column = new KanbanColumn(columnId, board, "Сделать", 0, LocalDateTime.now());
        UUID taskId = UUID.randomUUID();
        KanbanTask task = new KanbanTask(taskId, column, "Задача", null, 0, false, null, LocalDateTime.now());
        when(kanbanTaskRepository.GetTaskById(taskId)).thenReturn(Optional.of(task));

        UUID noteId = UUID.randomUUID();
        Note foreignNote = new Note(noteId, "Чужая заметка", null, LocalDateTime.now(), NoteTypeEnum.Empty, false, otherUser);
        when(noteRepository.GetNoteById(noteId)).thenReturn(Optional.of(foreignNote));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> kanbanService.LinkNoteToTask(ownerId, taskId, noteId));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(kanbanTaskRepository, never()).SaveTask(any());
    }

    @Test
    void deleteColumn_shouldDeleteTasksBeforeDeletingColumn() {
        UUID boardId = UUID.randomUUID();
        KanbanBoard board = new KanbanBoard(boardId, owner, LocalDateTime.now());
        UUID columnId = UUID.randomUUID();
        KanbanColumn column = new KanbanColumn(columnId, board, "Сделать", 0, LocalDateTime.now());
        when(kanbanColumnRepository.GetColumnById(columnId)).thenReturn(Optional.of(column));

        kanbanService.DeleteColumn(ownerId, columnId);

        org.mockito.InOrder inOrder = org.mockito.Mockito.inOrder(kanbanTaskRepository, kanbanColumnRepository);
        inOrder.verify(kanbanTaskRepository).DeleteTasksByColumnId(columnId);
        inOrder.verify(kanbanColumnRepository).DeleteColumnById(columnId);
    }

    @Test
    void getArchivedTasks_shouldReturnOnlyOwnersArchivedTasks() {
        UUID boardId = UUID.randomUUID();
        KanbanBoard board = new KanbanBoard(boardId, owner, LocalDateTime.now());
        UUID columnId = UUID.randomUUID();
        KanbanColumn column = new KanbanColumn(columnId, board, "Архив", 0, LocalDateTime.now());
        KanbanTask archivedTask = new KanbanTask(
                UUID.randomUUID(), column, "Старая задача", null, 0, true, null, LocalDateTime.now());

        when(kanbanTaskRepository.GetArchivedTasksByOwnerId(ownerId)).thenReturn(List.of(archivedTask));

        List<KanbanContracts.KanbanTaskResponse> archived = kanbanService.GetArchivedTasks(ownerId);

        assertEquals(1, archived.size());
        assertTrue(archived.get(0).archived());
    }

}
