package ru.rps.notesbook.Domain.Models;

import java.time.LocalDateTime;
import java.util.UUID;

public class Directory {

    private final UUID id;
    private String title;
    private final LocalDateTime createdDate;
    private User owner;

    public Directory(UUID id, String title,
                     LocalDateTime createdDate ,User owner) {

        ValidateTitle(title);
        ValidateOwner(owner);

        this.id = id;
        this.title = title;
        this.createdDate = createdDate;
        this.owner = owner;
    }

    public UUID GetId() { return this.id; }
    public String GetTitle() { return this.title; }
    public LocalDateTime GetCreatedDate() { return this.createdDate; }
    public User GetOwner() { return  this.owner; }

    public void ChangeTitle(String title) {
        ValidateTitle(title);
        this.title = title;
    }
    public void ChangeOwner(User owner) {
        ValidateOwner(owner);
        this.owner = owner;
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