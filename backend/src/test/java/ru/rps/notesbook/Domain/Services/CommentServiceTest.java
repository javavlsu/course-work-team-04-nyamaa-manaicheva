package ru.rps.notesbook.Domain.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.rps.notesbook.API.Contracts.CommentContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.ICommentRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private ICommentRepository commentRepository;
    @Mock
    private INoteRepository noteRepository;
    @Mock
    private IUserRepository userRepository;

    private CommentService commentService;

    @BeforeEach
    void setUp() {
        commentService = new CommentService(commentRepository, noteRepository, userRepository);
    }

    @Test
    void deleteCommentById_withUnknownId_shouldThrowException() {
        UUID commentId = UUID.randomUUID();
        when(commentRepository.GetCommentById(commentId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> commentService.DeleteCommentById(commentId));
        verify(commentRepository, never()).SaveComment(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void createComment_withUnknownNote_shouldThrowException() {
        UUID noteId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();
        when(noteRepository.GetNoteById(noteId)).thenReturn(Optional.empty());

        CommentContracts.CreateCommentRequest request = new CommentContracts.CreateCommentRequest("Комментарий");

        assertThrows(RuntimeException.class, () -> commentService.CreateComment(noteId, authorId, request));
        verify(commentRepository, never()).SaveComment(org.mockito.ArgumentMatchers.any());
    }

}
