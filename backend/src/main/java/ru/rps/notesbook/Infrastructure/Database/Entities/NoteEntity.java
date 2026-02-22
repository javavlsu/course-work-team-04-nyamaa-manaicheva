package ru.rps.notesbook.Infrastructure.Database.Entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;

import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "Note")
@Getter
@Setter
@NoArgsConstructor
public class NoteEntity {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false)
    private UUID id;

    @Column(name = "title", length = 150, nullable = false)
    private String title;

    @Column(name = "content", length = 1000)
    private String content;

    @CreationTimestamp
    @Column(name = "create_date", updatable = false)
    private Date createDate;

    @Column(name = "note_type", nullable = false, updatable = false)
    private NoteTypeEnum noteType;

    @ColumnDefault("false")
    @Column(name = "is_favourite", nullable = false)
    private boolean isFavourite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private UserEntity owner;

}