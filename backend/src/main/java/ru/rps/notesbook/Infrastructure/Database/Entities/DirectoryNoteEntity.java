package ru.rps.notesbook.Infrastructure.Database.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "directory_note")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DirectoryNoteEntity {

    @EmbeddedId
    private DirectoryNoteId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", nullable = false, insertable = false, updatable = false)
    private NoteEntity note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "directory_id", nullable = false, insertable = false, updatable = false)
    private DirectoryEntity directory;

}