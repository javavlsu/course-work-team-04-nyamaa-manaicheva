package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.Comment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ICommentRepository {

    List<Comment> GetCommentsByNoteId(UUID noteId);
    Optional<Comment> GetCommentById(UUID id);
    Comment SaveComment(Comment comment);
    void DeleteCommentById(UUID id);
    void DeleteCommentsByNoteId(UUID noteId);
    
}