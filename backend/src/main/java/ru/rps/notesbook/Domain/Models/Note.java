package ru.rps.notesbook.Domain.Models;

import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;

import java.time.LocalDateTime;
import java.util.UUID;

public class Note {

    private final UUID id;
    private String title;
    private String content;
    private final LocalDateTime createDate;
    private final NoteTypeEnum noteType;
    private boolean isFavourite;
    private User owner;

    public Note(UUID id, String title, String content,
                LocalDateTime createDate, NoteTypeEnum noteType,
                boolean isFavourite, User owner) {
        ValidateTitle(title);
        ValidateContent(content);
        ValidateNoteType(noteType);
        ValidateOwner(owner);

        this.id = id;
        this.title = title;
        this.content = content;
        this.createDate = createDate;
        this.noteType = noteType;
        this.isFavourite = isFavourite;
        this.owner = owner;
    }

    public UUID GetId() { return this.id; }
    public String GetTitle() { return this.title; }
    public String GetContent() { return this.content; }
    public LocalDateTime GetCreateDate() { return this.createDate; }
    public NoteTypeEnum GetNoteType() { return this.noteType; }
    public boolean GetIsFavourite() { return this.isFavourite; }
    public User GetOwner() { return this.owner; }

    public void ChangeTitle(String title) {
        ValidateTitle(title);
        this.title = title;
    }
    public void ChangeContent(String content) {
        ValidateContent(content);
        this.content = content;
    }
    public void ChangeIsFavourite(boolean isFavourite) {
        this.isFavourite = isFavourite;
    }
    public void ChangeOwner(User owner) {
        ValidateOwner(owner);
        this.owner = owner;
    }

    public void ValidateTitle(String title) {
        if (title == null || title.isEmpty()) {
            throw new IllegalArgumentException("title can't be null or empty");
        }
        if (title.strip().length() > 150) {
            throw new IllegalArgumentException("title is too long");
        }
    }
    public void ValidateContent(String content) {
        if (content != null && content.length() > 1000) {
            throw new IllegalArgumentException("content is too long");
        }
    }
    public void ValidateNoteType(NoteTypeEnum noteType) {
        if (noteType == null) {
            throw new IllegalArgumentException("note type can't be null");
        }
        if (noteType != NoteTypeEnum.Empty && noteType != NoteTypeEnum.List
                && noteType != NoteTypeEnum.Table && noteType != NoteTypeEnum.Kanban
                && noteType != NoteTypeEnum.Calendar) {
            throw new IllegalArgumentException("note type is not valid");
        }
    }
    public void ValidateOwner(User owner) {
        if (owner == null) {
            throw new IllegalArgumentException("owner can't be null");
        }
    }

}