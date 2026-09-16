package ru.rps.notesbook.Infrastructure.Database.Repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.rps.notesbook.Domain.Interfaces.Repository.IKanbanBoardRepository;
import ru.rps.notesbook.Domain.Models.KanbanBoard;
import ru.rps.notesbook.Infrastructure.Database.Adapters.KanbanBoardAdapterJPA;
import ru.rps.notesbook.Infrastructure.Database.Entities.KanbanBoardEntity;
import ru.rps.notesbook.Infrastructure.Database.Mappers.KanbanBoardMapper;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class KanbanBoardRepository implements IKanbanBoardRepository {

    private final KanbanBoardAdapterJPA kanbanBoardAdapterJPA;
    private final KanbanBoardMapper kanbanBoardMapper;

    @Override
    public Optional<KanbanBoard> GetBoardById(UUID id)
    {
        return kanbanBoardAdapterJPA.findById(id).map(kanbanBoardMapper::ToDomain);
    }

    @Override
    public Optional<KanbanBoard> GetBoardByOwnerId(UUID ownerId)
    {
        return kanbanBoardAdapterJPA.findByOwner_Id(ownerId).map(kanbanBoardMapper::ToDomain);
    }

    @Override
    @Transactional
    public KanbanBoard SaveBoard(KanbanBoard board)
    {
        KanbanBoardEntity entity = kanbanBoardMapper.ToEntity(board);

        KanbanBoardEntity savedEntity = kanbanBoardAdapterJPA.save(entity);

        return kanbanBoardMapper.ToDomain(savedEntity);
    }

    @Override
    public void DeleteBoardById(UUID id)
    {
        kanbanBoardAdapterJPA.deleteById(id);
    }

}
