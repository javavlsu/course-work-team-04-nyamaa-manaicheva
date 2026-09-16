package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteTagEntity;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteTagId;

import java.util.List;
import java.util.UUID;

@Repository
public interface NoteTagAdapterJPA extends JpaRepository<NoteTagEntity, NoteTagId> {

    List<NoteTagEntity> findByNote_Id(UUID noteId);

    void deleteByNote_Id(UUID noteId);

    void deleteByTag_Id(UUID tagId);

}