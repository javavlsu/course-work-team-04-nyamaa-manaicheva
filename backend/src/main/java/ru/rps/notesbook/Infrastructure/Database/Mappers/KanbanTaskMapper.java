package ru.rps.notesbook.Infrastructure.Database.Mappers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.rps.notesbook.Domain.Models.KanbanTask;
import ru.rps.notesbook.Infrastructure.Database.Entities.KanbanTaskEntity;

@Component
@RequiredArgsConstructor
public class KanbanTaskMapper {

    private final KanbanColumnMapper kanbanColumnMapper;
    private final NoteMapper noteMapper;

    public KanbanTask ToDomain(KanbanTaskEntity entity)
    {
        return new KanbanTask(
                entity.getId(),
                kanbanColumnMapper.ToDomain(entity.getColumn()),
                entity.getTitle(),
                entity.getDescription(),
                entity.getPosition(),
                entity.getStatus(),
                entity.getArchived(),
                entity.getNote() != null ? noteMapper.ToDomain(entity.getNote()) : null,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public KanbanTaskEntity ToEntity(KanbanTask task)
    {
        return new KanbanTaskEntity(
                task.GetId(),
                kanbanColumnMapper.ToEntity(task.GetColumn()),
                task.GetTitle(),
                task.GetDescription(),
                task.GetPosition(),
                task.GetStatus(),
                task.IsArchived(),
                task.GetNote() != null ? noteMapper.ToEntity(task.GetNote()) : null,
                task.GetCreatedAt(),
                task.GetUpdatedAt()
        );
    }

}
