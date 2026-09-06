package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.KanbanTask;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IKanbanTaskRepository {

    List<KanbanTask> GetTasksByColumnId(UUID columnId);
    List<KanbanTask> GetTasksByNoteId(UUID noteId);
    Optional<KanbanTask> GetTaskById(UUID id);
    KanbanTask SaveTask(KanbanTask task);
    void DeleteTaskById(UUID id);
    void DeleteTasksByColumnId(UUID columnId);

}
