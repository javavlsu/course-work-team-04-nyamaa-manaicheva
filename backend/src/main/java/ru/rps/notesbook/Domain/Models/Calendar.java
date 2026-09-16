package ru.rps.notesbook.Domain.Models;

import java.time.LocalDateTime;
import java.util.UUID;

public class Calendar {

    private final UUID id;
    private User owner;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Calendar(UUID id, User owner, LocalDateTime createdAt) {
        this(id, owner, createdAt, createdAt);
    }

    public Calendar(UUID id, User owner, LocalDateTime createdAt, LocalDateTime updatedAt) {
        ValidateOwner(owner);

        this.id = id;
        this.owner = owner;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID GetId() { return this.id; }
    public User GetOwner() { return this.owner; }
    public LocalDateTime GetCreatedAt() { return this.createdAt; }
    public LocalDateTime GetUpdatedAt() { return this.updatedAt; }

    public void ChangeOwner(User owner) {
        ValidateOwner(owner);
        this.owner = owner;
        this.updatedAt = LocalDateTime.now();
    }

    public void Touch() {
        this.updatedAt = LocalDateTime.now();
    }

    public void ValidateOwner(User owner) {
        if (owner == null) {
            throw new IllegalArgumentException("owner can't be null");
        }
    }

}
