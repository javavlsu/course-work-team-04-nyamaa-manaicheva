package ru.rps.notesbook.Domain.Models;

public class DirectoryNote {


    private Note note;
    private Directory directory;

    public DirectoryNote(Note note, Directory directory) {
        ValidateNote(note);
        ValidateDirectory(directory);

        this.note = note;
        this.directory = directory;
    }
    
    public Note GetNote() { return  this.note; }
    public Directory GetDirectory() { return this.directory; }

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