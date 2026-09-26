package ru.rps.notesbook.API.Controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.CommentContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.ICommentService;
import ru.rps.notesbook.Domain.Interfaces.Services.IPermissionAccessService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Юнит-тесты для {@link CommentController}.
 * Соответствует пунктам 28-30 чек-листа: право редактирования заметки при создании комментария
 * и авторство при его редактировании — эти проверки реализованы здесь, а не в CommentService.
 */
@ExtendWith(MockitoExtension.class)
class CommentControllerTest {

    @Mock
    private ICommentService commentService;
    @Mock
    private IPermissionAccessService permissionAccessService;

    private CommentController controller;

    private NotesbookUserPrincipal principal;
    private UUID userId;
    private UUID noteId;

    @BeforeEach
    void setUp() {
        controller = new CommentController(commentService, permissionAccessService);

        userId = UUID.randomUUID();
        noteId = UUID.randomUUID();
        principal = new NotesbookUserPrincipal(userId, "user@example.com", "hash", List.of());
    }

    // 28. Добавление комментария к заметке с правом редактирования
    @Test
    void createComment_withEditPermission_shouldCreateComment() {
        when(permissionAccessService.canEditNote(userId, noteId)).thenReturn(true);

        CommentContracts.CreateCommentRequest request = new CommentContracts.CreateCommentRequest("Отличная заметка!");
        CommentContracts.CommentResponse expected = new CommentContracts.CommentResponse(
                UUID.randomUUID(), noteId, userId, "Отличная заметка!", LocalDateTime.now(), LocalDateTime.now());
        when(commentService.CreateComment(noteId, userId, request)).thenReturn(expected);

        CommentContracts.CommentResponse response = controller.createComment(principal, noteId, request);

        assertEquals(expected, response);
        verify(commentService).CreateComment(noteId, userId, request);
    }

    // 29. Добавление комментария без права редактирования заметки
    @Test
    void createComment_withoutEditPermission_shouldThrowForbidden() {
        when(permissionAccessService.canEditNote(userId, noteId)).thenReturn(false);

        CommentContracts.CreateCommentRequest request = new CommentContracts.CreateCommentRequest("Комментарий");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.createComment(principal, noteId, request));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(commentService, never()).CreateComment(any(), any(), any());
    }

    // 30. Редактирование комментария не его автором
    @Test
    void updateComment_byNonAuthor_shouldThrowForbidden() {
        UUID commentId = UUID.randomUUID();
        UUID actualAuthorId = UUID.randomUUID();
        CommentContracts.CommentResponse existing = new CommentContracts.CommentResponse(
                commentId, noteId, actualAuthorId, "Старый текст", LocalDateTime.now(), LocalDateTime.now());
        when(commentService.GetCommentById(commentId)).thenReturn(existing);

        CommentContracts.UpdateCommentRequest request = new CommentContracts.UpdateCommentRequest("Новый текст");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.updateComment(principal, commentId, request));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(commentService, never()).UpdateComment(any(), any());
    }

}
