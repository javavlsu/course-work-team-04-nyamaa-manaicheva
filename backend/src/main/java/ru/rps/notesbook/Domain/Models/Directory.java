package ru.rps.notesbook.Domain.Models;

import java.time.LocalDateTime;
import java.util.UUID;

public class Directory {

    private final UUID id;
    private String title;
    private final LocalDateTime createdDate = LocalDateTime.now();
    private User owner;

    public Directory(UUID id, String title, User owner)
    {
        // validation

        this.id = id;
        this.title = title;
        this.owner = owner;
    }

    public void ChangeTitle(String title)
    {
        // validation

        this.title = title;
    }
    public void ChangeOwner(User owner)
    {
        // validation

        this.owner = owner;
    }

    public UUID GetId() { return this.id; }
    public String GetTitle() { return this.title; }
    public LocalDateTime GetCreatedDate() { return this.createdDate; }
    public User GetOwner() { return  this.owner; }

}