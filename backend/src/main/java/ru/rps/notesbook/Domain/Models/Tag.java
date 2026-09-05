package ru.rps.notesbook.Domain.Models;

import java.time.LocalDateTime;
import java.util.UUID;

public class Tag {

    private final UUID id;
    private String name;
    private final User owner;
    private final LocalDateTime createdAt;
    private LocalDateTime deletedAt;

    public Tag(UUID id, String name, User owner, LocalDateTime createdAt) {
        this(id, name, owner, createdAt, null);
    }

    public Tag(UUID id, String name, User owner, LocalDateTime createdAt, LocalDateTime deletedAt) {
        ValidateName(name);
        ValidateOwner(owner);

        this.id = id;
        this.name = name;
        this.owner = owner;
        this.createdAt = createdAt;
        this.deletedAt = deletedAt;
    }

    public UUID GetId() { return this.id; }
    public String GetName() { return this.name; }
    public User GetOwner() { return this.owner; }
    public LocalDateTime GetCreatedAt() { return this.createdAt; }
    public LocalDateTime GetDeletedAt() { return this.deletedAt; }

    public void ChangeName(String name) {
        ValidateName(name);
        this.name = name;
    }

    // Простые методы soft delete
    public void MarkDeleted() {
        this.deletedAt = LocalDateTime.now();
    }
    public void Restore() {
        this.deletedAt = null;
    }

    public void ValidateName(String name) {
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("name can't be null or empty");
        }
        if (name.strip().length() > 50) {
            throw new IllegalArgumentException("name is too long");
        }
    }
    public void ValidateOwner(User owner) {
        if (owner == null) {
            throw new IllegalArgumentException("owner can't be null");
        }
    }
}