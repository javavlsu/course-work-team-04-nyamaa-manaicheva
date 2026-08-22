package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.Comment;
import ru.rps.notesbook.Infrastructure.Database.Entities.CommentEntity;

@Component
@RequiredArgsConstructor
public class CommentMapper {

    private final NoteMapper noteMapper;
    private final UserMapper userMapper;

    public Comment ToDomain(CommentEntity entity)
    {
        return new Comment(
                entity.getId(),
                noteMapper.ToDomain(entity.getNote()),
                userMapper.ToDomain(entity.getAuthor()),
                entity.getContent(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getDeletedAt()
        );
    }

    public CommentEntity ToEntity(Comment comment)
    {
        return new CommentEntity(
                comment.GetId(),
                noteMapper.ToEntity(comment.GetNote()),
                userMapper.ToEntity(comment.GetAuthor()),
                comment.GetContent(),
                comment.GetCreatedAt(),
                comment.GetUpdatedAt(),
                comment.GetDeletedAt()
        );
    }
}