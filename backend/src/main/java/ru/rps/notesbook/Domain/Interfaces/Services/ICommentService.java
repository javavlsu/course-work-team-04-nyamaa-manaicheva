package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.CommentContracts;

import java.util.List;
import java.util.UUID;

public interface ICommentService {

    List<CommentContracts.CommentResponse> GetCommentsByNoteId(UUID noteId);

    CommentContracts.CommentResponse GetCommentById(UUID id);

    CommentContracts.CommentResponse CreateComment(UUID noteId, UUID authorId, CommentContracts.CreateCommentRequest request);

    CommentContracts.CommentResponse UpdateComment(UUID id, CommentContracts.UpdateCommentRequest request);

    void DeleteCommentById(UUID id);

}