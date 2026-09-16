package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.API.Contracts.CommentContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.ICommentRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.ICommentService;
import ru.rps.notesbook.Domain.Models.Comment;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService implements ICommentService {

    private final ICommentRepository commentRepository;
    private final INoteRepository noteRepository;
    private final IUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CommentContracts.CommentResponse> GetCommentsByNoteId(UUID noteId) {
        return commentRepository.GetCommentsByNoteId(noteId).stream()
                .map(CommentService::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CommentContracts.CommentResponse GetCommentById(UUID id) {
        return toResponse(commentRepository.GetCommentById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found")));
    }

    @Override
    @Transactional
    public CommentContracts.CommentResponse CreateComment(UUID noteId, UUID authorId, CommentContracts.CreateCommentRequest request) {
        Note note = noteRepository.GetNoteById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        User author = userRepository.GetUserById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment(
                UUID.randomUUID(),
                note,
                author,
                request.content(),
                LocalDateTime.now()
        );

        return toResponse(commentRepository.SaveComment(comment));
    }

    @Override
    @Transactional
    public CommentContracts.CommentResponse UpdateComment(UUID id, CommentContracts.UpdateCommentRequest request) {
        Comment comment = commentRepository.GetCommentById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (request.content() != null) {
            comment.ChangeContent(request.content());
        }

        return toResponse(commentRepository.SaveComment(comment));
    }

    @Override
    @Transactional
    public void DeleteCommentById(UUID id) {
        Comment comment = commentRepository.GetCommentById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        comment.MarkDeleted();

        commentRepository.SaveComment(comment);
    }

    private static CommentContracts.CommentResponse toResponse(Comment c) {
        return new CommentContracts.CommentResponse(
                c.GetId(),
                c.GetNote().GetId(),
                c.GetAuthor().GetId(),
                c.GetContent(),
                c.GetCreatedAt(),
                c.GetUpdatedAt()
        );
    }

}