package ru.rps.notesbook.Domain.Models;

import java.time.LocalDateTime;

public class NoteTag {

    private Note note;
    private Tag tag;
    private final LocalDateTime addedAt;

    public NoteTag(Note note, Tag tag) {
        this(note, tag, LocalDateTime.now());
    }

    public NoteTag(Note note, Tag tag, LocalDateTime addedAt) {
        ValidateNote(note);
        ValidateTag(tag);

        this.note = note;
        this.tag = tag;
        this.addedAt = addedAt;
    }

    public Note GetNote() { return this.note; }
    public Tag GetTag() { return this.tag; }
    public LocalDateTime GetAddedAt() { return this.addedAt; }

    public void ChangeNote(Note note) {
        ValidateNote(note);
        this.note = note;
    }
    public void ChangeTag(Tag tag) {
        ValidateTag(tag);
        this.tag = tag;
    }

    public void ValidateNote(Note note) {
        if (note == null) {
            throw new IllegalArgumentException("note can't be null");
        }
    }
    public void ValidateTag(Tag tag) {
        if (tag == null) {
            throw new IllegalArgumentException("tag can't be null");
        }
    }
    
}