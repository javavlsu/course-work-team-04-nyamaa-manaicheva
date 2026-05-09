package ru.rps.notesbook.Infrastructure.Database.Entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class DirectoryNoteId {

    @Column(name = "note_id")
    private UUID noteId;

    @Column(name = "directory_id")
    private UUID directoryId;
}