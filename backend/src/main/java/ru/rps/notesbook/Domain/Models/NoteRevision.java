package ru.rps.notesbook.Domain.Models;

import java.time.LocalDateTime;
import java.util.UUID;

public class NoteRevision {

    private final UUID id;
    private final Note note;
    private final String title;
    private final String content;
    private final Long version;
    private final LocalDateTime createdAt;
    private final User createdBy;

    public NoteRevision(UUID id, Note note, String title, String content,
                        Long version, LocalDateTime createdAt, User createdBy) {
        ValidateNote(note);
        ValidateTitle(title);
        ValidateVersion(version);
        ValidateCreatedBy(createdBy);

        this.id = id;
        this.note = note;
        this.title = title;
        this.content = content;
        this.version = version;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
    }

    public UUID GetId() { return this.id; }
    public Note GetNote() { return this.note; }
    public String GetTitle() { return this.title; }
    public String GetContent() { return this.content; }
    public Long GetVersion() { return this.version; }
    public LocalDateTime GetCreatedAt() { return this.createdAt; }
    public User GetCreatedBy() { return this.createdBy; }

    public void ValidateNote(Note note) {
        if (note == null) {
            throw new IllegalArgumentException("note can't be null");
        }
    }
    public void ValidateTitle(String title) {
        if (title == null || title.isEmpty()) {
            throw new IllegalArgumentException("title can't be null or empty");
        }
        if (title.strip().length() > 150) {
            throw new IllegalArgumentException("title is too long");
        }
    }
    public void ValidateVersion(Long version) {
        if (version == null) {
            throw new IllegalArgumentException("version can't be null");
        }
    }
    public void ValidateCreatedBy(User createdBy) {
        if (createdBy == null) {
            throw new IllegalArgumentException("created by can't be null");
        }
    }
}