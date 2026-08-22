package ru.rps.notesbook.Domain.Models;

import java.time.LocalDateTime;
import java.util.UUID;

public class Comment {

    private final UUID id;
    private final Note note;
    private final User author;
    private String content;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    public Comment(UUID id, Note note, User author, String content, LocalDateTime createdAt) {
        this(id, note, author, content, createdAt, createdAt, null);
    }

    public Comment(UUID id, Note note, User author, String content,
                   LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime deletedAt) {
        ValidateNote(note);
        ValidateAuthor(author);
        ValidateContent(content);

        this.id = id;
        this.note = note;
        this.author = author;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    public UUID GetId() { return this.id; }
    public Note GetNote() { return this.note; }
    public User GetAuthor() { return this.author; }
    public String GetContent() { return this.content; }
    public LocalDateTime GetCreatedAt() { return this.createdAt; }
    public LocalDateTime GetUpdatedAt() { return this.updatedAt; }
    public LocalDateTime GetDeletedAt() { return this.deletedAt; }

    public void ChangeContent(String content) {
        ValidateContent(content);
        this.content = content;
        this.updatedAt = LocalDateTime.now();
    }

    // Простые методы soft delete на будущее
    public void MarkDeleted() {
        this.deletedAt = LocalDateTime.now();
    }
    public void Restore() {
        this.deletedAt = null;
    }

    public void ValidateNote(Note note) {
        if (note == null) {
            throw new IllegalArgumentException("note can't be null");
        }
    }
    public void ValidateAuthor(User author) {
        if (author == null) {
            throw new IllegalArgumentException("author can't be null");
        }
    }
    public void ValidateContent(String content) {
        if (content == null || content.isEmpty()) {
            throw new IllegalArgumentException("content can't be null or empty");
        }
    }
}
