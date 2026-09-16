package ru.rps.notesbook.Infrastructure.Database.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "note_tag")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoteTagEntity {

    @EmbeddedId
    private NoteTagId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", nullable = false, insertable = false, updatable = false)
    private NoteEntity note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false, insertable = false, updatable = false)
    private TagEntity tag;

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;

}
