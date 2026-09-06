package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.KanbanColumn;
import ru.rps.notesbook.Infrastructure.Database.Entities.KanbanColumnEntity;

@Component
@RequiredArgsConstructor
public class KanbanColumnMapper {

    private final KanbanBoardMapper kanbanBoardMapper;

    public KanbanColumn ToDomain(KanbanColumnEntity entity)
    {
        return new KanbanColumn(
                entity.getId(),
                kanbanBoardMapper.ToDomain(entity.getBoard()),
                entity.getTitle(),
                entity.getPosition(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public KanbanColumnEntity ToEntity(KanbanColumn column)
    {
        return new KanbanColumnEntity(
                column.GetId(),
                kanbanBoardMapper.ToEntity(column.GetBoard()),
                column.GetTitle(),
                column.GetPosition(),
                column.GetCreatedAt(),
                column.GetUpdatedAt()
        );
    }

}
