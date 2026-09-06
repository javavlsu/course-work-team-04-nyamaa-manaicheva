package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.KanbanColumn;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IKanbanColumnRepository {

    List<KanbanColumn> GetColumnsByBoardId(UUID boardId);
    Optional<KanbanColumn> GetColumnById(UUID id);
    KanbanColumn SaveColumn(KanbanColumn column);
    void DeleteColumnById(UUID id);
    void DeleteColumnsByBoardId(UUID boardId);

}
