package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.KanbanBoard;
import ru.rps.notesbook.Infrastructure.Database.Entities.KanbanBoardEntity;

@Component
@RequiredArgsConstructor
public class KanbanBoardMapper {

    private final UserMapper userMapper;

    public KanbanBoard ToDomain(KanbanBoardEntity entity)
    {
        return new KanbanBoard(
                entity.getId(),
                userMapper.ToDomain(entity.getOwner()),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public KanbanBoardEntity ToEntity(KanbanBoard board)
    {
        return new KanbanBoardEntity(
                board.GetId(),
                userMapper.ToEntity(board.GetOwner()),
                board.GetCreatedAt(),
                board.GetUpdatedAt()
        );
    }

}
