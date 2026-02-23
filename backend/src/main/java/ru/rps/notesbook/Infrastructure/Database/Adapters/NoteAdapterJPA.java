package ru.rps.notesbook.Infrastructure.Database.Adapters;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Infrastructure.Database.Entities.NoteEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface NoteAdapterJPA extends JpaRepository<NoteEntity, UUID> {

    List<NoteEntity> findNotesByUserId(UUID userId);

}