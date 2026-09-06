package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.KanbanTaskEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface KanbanTaskAdapterJPA extends JpaRepository<KanbanTaskEntity, UUID> {

    List<KanbanTaskEntity> findByColumn_Id(UUID columnId);

    List<KanbanTaskEntity> findByNote_Id(UUID noteId);

    void deleteByColumn_Id(UUID columnId);

}
