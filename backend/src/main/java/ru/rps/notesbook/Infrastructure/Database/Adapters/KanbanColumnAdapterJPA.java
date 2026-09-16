package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.KanbanColumnEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface KanbanColumnAdapterJPA extends JpaRepository<KanbanColumnEntity, UUID> {

    List<KanbanColumnEntity> findByBoard_Id(UUID boardId);

    void deleteByBoard_Id(UUID boardId);

}
