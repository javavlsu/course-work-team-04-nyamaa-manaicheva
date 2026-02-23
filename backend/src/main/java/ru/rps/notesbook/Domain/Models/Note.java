package ru.rps.notesbook.Domain.Models;

import jakarta.persistence.Table;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;

import java.time.LocalDateTime;
import java.util.UUID;

public class Note {

    private final UUID id;
    private String title;
    private String content;
    private final LocalDateTime createDate = LocalDateTime.now();
    private final NoteTypeEnum noteType;
    private boolean isFavourite;
    private User owner;

    public Note(UUID id, String title, String content,
                LocalDateTime createDate, NoteTypeEnum noteType,
                boolean isFavourite, User owner)
    {
        // validation

        this.id = id;
        this.title = title;
        this.content = content;
        this.noteType = noteType;
        this.isFavourite = isFavourite;
        this.owner = owner;
    }

    public void ChangeTitle(String title) {
        // validation

        this.title = title;
    }
    public void ChangeContent(String content)
    {
        // validation

        this.content = content;
    }
    public void ChangeIsFavourite(boolean isFavourite)
    {
        // validation

        this.isFavourite = isFavourite;
    }

    public void ChangeOwner(User owner)
    {
        // validation

        this.owner = owner;
    }

    public UUID GetId() { return this.id; }
    public String GetTitle() { return this.title; }
    public String GetContent() { return this.content; }
    public LocalDateTime GetCreateDate() { return this.createDate; }
    public NoteTypeEnum GetNoteType() { return this.noteType; }
    public boolean GetIsFavourite() { return this.isFavourite; }
    public User GetOwner() { return this.owner; }
}