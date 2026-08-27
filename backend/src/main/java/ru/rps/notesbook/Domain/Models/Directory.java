package ru.rps.notesbook.Domain.Models;

import java.time.LocalDateTime;
import java.util.UUID;

public class Directory {

    private final UUID id;
    private String title;
    private final LocalDateTime createdDate;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private User owner;
    private final Long version;

    public Directory(UUID id, String title, LocalDateTime createdDate, User owner) {
        this(id, title, createdDate, createdDate, null, owner, null);
    }

    public Directory(UUID id, String title, LocalDateTime createdDate,
                     LocalDateTime updatedAt, LocalDateTime deletedAt,
                     User owner, Long version) {
        ValidateTitle(title);
        ValidateOwner(owner);

        this.id = id;
        this.title = title;
        this.createdDate = createdDate;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.owner = owner;
        this.version = version;
    }

    public UUID GetId() { return this.id; }
    public String GetTitle() { return this.title; }
    public LocalDateTime GetCreatedDate() { return this.createdDate; }
    public LocalDateTime GetUpdatedAt() { return this.updatedAt; }
    public LocalDateTime GetDeletedAt() { return this.deletedAt; }
    public User GetOwner() { return  this.owner; }
    public Long GetVersion() { return this.version; }

    public void ChangeTitle(String title) {
        ValidateTitle(title);
        this.title = title;
        this.updatedAt = LocalDateTime.now();
    }
    public void ChangeOwner(User owner) {
        ValidateOwner(owner);
        this.owner = owner;
        this.updatedAt = LocalDateTime.now();
    }

    // Простые методы soft delete на будущее
    public void MarkDeleted() {
        LocalDateTime now = LocalDateTime.now();
        this.deletedAt = now;
        this.updatedAt = now;
    }
    public void Restore() {
        this.deletedAt = null;
        this.updatedAt = LocalDateTime.now();
    }

    public void ValidateTitle(String title) {
        if (title == null || title.isEmpty()) {
            throw new IllegalArgumentException("title can't be null or empty");
        }
        if (title.strip().length() > 75) {
            throw new IllegalArgumentException("title is too long");
        }
    }
    public void ValidateOwner(User owner) {
        if (owner == null) {
            throw new IllegalArgumentException("owner can't be null");
        }
    }
}