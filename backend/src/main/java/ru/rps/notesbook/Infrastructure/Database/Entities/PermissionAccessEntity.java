package ru.rps.notesbook.Infrastructure.Database.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.rps.notesbook.Domain.Enum.PermissionTypeEnum;

import java.util.UUID;

@Entity
@Table(name = "PermissionAccess")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PermissionAccessEntity {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "type", nullable = false)
    private PermissionTypeEnum type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", nullable = false)
    private NoteEntity note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_granted", nullable = false)
    private UserEntity userGranted;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "directory_id", nullable = false)
    private DirectoryEntity directory;

}