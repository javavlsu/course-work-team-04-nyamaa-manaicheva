package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.Domain.Interfaces.Repository.IKanbanColumnRepository;
import ru.rps.notesbook.Domain.Models.KanbanColumn;
import ru.rps.notesbook.Infrastructure.Database.Adapters.KanbanColumnAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.KanbanColumnEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.KanbanColumnMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class KanbanColumnRepository implements IKanbanColumnRepository {

    private final KanbanColumnAdapterJPA kanbanColumnAdapterJPA;
    private final KanbanColumnMapper kanbanColumnMapper;

    @Override
    public List<KanbanColumn> GetColumnsByBoardId(UUID boardId)
    {
        return kanbanColumnAdapterJPA.findByBoard_Id(boardId)
                .stream()
                .map(kanbanColumnMapper::ToDomain)
                .toList();
    }

    @Override
    public Optional<KanbanColumn> GetColumnById(UUID id)
    {
        return kanbanColumnAdapterJPA.findById(id).map(kanbanColumnMapper::ToDomain);
    }

    @Override
    @Transactional
    public KanbanColumn SaveColumn(KanbanColumn column)
    {
        KanbanColumnEntity entity = kanbanColumnMapper.ToEntity(column);

        KanbanColumnEntity savedEntity = kanbanColumnAdapterJPA.save(entity);

        return kanbanColumnMapper.ToDomain(savedEntity);
    }

    @Override
    public void DeleteColumnById(UUID id)
    {
        kanbanColumnAdapterJPA.deleteById(id);
    }

    @Override
    @Transactional
    public void DeleteColumnsByBoardId(UUID boardId)
    {
        kanbanColumnAdapterJPA.deleteByBoard_Id(boardId);
    }

}
