package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteRevisionEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface NoteRevisionAdapterJPA extends JpaRepository<NoteRevisionEntity, UUID> {

    List<NoteRevisionEntity> findByNote_IdOrderByVersionDesc(UUID noteId);

    void deleteByNote_Id(UUID noteId);

}