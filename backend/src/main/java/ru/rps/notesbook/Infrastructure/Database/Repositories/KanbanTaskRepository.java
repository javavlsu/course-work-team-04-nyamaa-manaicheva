package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.Domain.Interfaces.Repository.IKanbanTaskRepository;
import ru.rps.notesbook.Domain.Models.KanbanTask;
import ru.rps.notesbook.Infrastructure.Database.Adapters.KanbanTaskAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.KanbanTaskEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.KanbanTaskMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class KanbanTaskRepository implements IKanbanTaskRepository {

    private final KanbanTaskAdapterJPA kanbanTaskAdapterJPA;
    private final KanbanTaskMapper kanbanTaskMapper;

    @Override
    public List<KanbanTask> GetTasksByColumnId(UUID columnId)
    {
        return kanbanTaskAdapterJPA.findByColumn_Id(columnId)
                .stream()
                .map(kanbanTaskMapper::ToDomain)
                .toList();
    }

    @Override
    public List<KanbanTask> GetTasksByNoteId(UUID noteId)
    {
        return kanbanTaskAdapterJPA.findByNote_Id(noteId)
                .stream()
                .map(kanbanTaskMapper::ToDomain)
                .toList();
    }

    @Override
    public Optional<KanbanTask> GetTaskById(UUID id)
    {
        return kanbanTaskAdapterJPA.findById(id).map(kanbanTaskMapper::ToDomain);
    }

    @Override
    @Transactional
    public KanbanTask SaveTask(KanbanTask task)
    {
        KanbanTaskEntity entity = kanbanTaskMapper.ToEntity(task);

        KanbanTaskEntity savedEntity = kanbanTaskAdapterJPA.save(entity);

        return kanbanTaskMapper.ToDomain(savedEntity);
    }

    @Override
    public void DeleteTaskById(UUID id)
    {
        kanbanTaskAdapterJPA.deleteById(id);
    }

    @Override
    @Transactional
    public void DeleteTasksByColumnId(UUID columnId)
    {
        kanbanTaskAdapterJPA.deleteByColumn_Id(columnId);
    }

}
