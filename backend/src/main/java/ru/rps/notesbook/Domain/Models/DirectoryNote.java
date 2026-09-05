package ru.rps.notesbook.Domain.Models;

import java.time.LocalDateTime;

public class DirectoryNote {

    private Note note;
    private Directory directory;
    private final LocalDateTime addedAt;

    public DirectoryNote(Note note, Directory directory) {
        this(note, directory, LocalDateTime.now());
    }

    public DirectoryNote(Note note, Directory directory, LocalDateTime addedAt) {
        ValidateNote(note);
        ValidateDirectory(directory);

        this.note = note;
        this.directory = directory;
        this.addedAt = addedAt;
    }

    public Note GetNote() { return  this.note; }
    public Directory GetDirectory() { return this.directory; }
    public LocalDateTime GetAddedAt() { return this.addedAt; }

    public void ChangeNote(Note note) {
        ValidateNote(note);
        this.note = note;
    }
    public void ChangeDirectory(Directory directory) {
        ValidateDirectory(directory);
        this.directory = directory;
    }

    public void ValidateNote(Note note) {
        if (note == null) {
            throw new IllegalArgumentException("note can't be null");
        }
    }
    public void ValidateDirectory(Directory directory) {
        if (directory == null) {
            throw new IllegalArgumentException("directory can't be null");
        }
    }

}