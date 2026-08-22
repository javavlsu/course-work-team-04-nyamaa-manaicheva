package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.Domain.Interfaces.Repository.ICommentRepository;
import ru.rps.notesbook.Domain.Models.Comment;
import ru.rps.notesbook.Infrastructure.Database.Adapters.CommentAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.CommentEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.CommentMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CommentRepository implements ICommentRepository {

    private final CommentAdapterJPA commentAdapterJPA;
    private final CommentMapper commentMapper;

    @Override
    public List<Comment> GetCommentsByNoteId(UUID noteId)
    {
        return commentAdapterJPA.findByNote_Id(noteId)
                .stream()
                .map(commentMapper::ToDomain)
                .toList();
    }

    @Override
    public Optional<Comment> GetCommentById(UUID id)
    {
        return commentAdapterJPA.findById(id).map(commentMapper::ToDomain);
    }

    @Override
    @Transactional
    public Comment SaveComment(Comment comment)
    {
        CommentEntity entity = commentMapper.ToEntity(comment);

        CommentEntity createdEntity = commentAdapterJPA.save(entity);

        return commentMapper.ToDomain(createdEntity);
    }

    @Override
    public void DeleteCommentById(UUID id)
    {
        commentAdapterJPA.deleteById(id);
    }

    @Override
    public void DeleteCommentsByNoteId(UUID noteId)
    {
        commentAdapterJPA.deleteByNote_Id(noteId);
    }
}
