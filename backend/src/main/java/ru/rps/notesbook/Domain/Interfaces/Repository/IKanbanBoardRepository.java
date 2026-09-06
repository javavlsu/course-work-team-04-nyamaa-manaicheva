package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.KanbanBoard;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IKanbanBoardRepository {

    Optional<KanbanBoard> GetBoardById(UUID id);
    Optional<KanbanBoard> GetBoardByOwnerId(UUID ownerId);
    KanbanBoard SaveBoard(KanbanBoard board);
    void DeleteBoardById(UUID id);

}
