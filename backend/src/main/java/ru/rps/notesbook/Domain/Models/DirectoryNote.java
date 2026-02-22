package ru.rps.notesbook.Domain.Models;

public class DirectoryNote {

    private Note note;
    private Directory directory;

    public DirectoryNote(Note note, Directory directory)
    {
        // validation

        this.note = note;
        this.directory = directory;
    }

    public void ChangeNote(Note note) {
        // validation

        this.note = note;
    }
    public void ChangeDirectory(Directory directory){
        // validation

        this.directory = directory;
    }

    public Note GetNote() { return  this.note; }
    public Directory GetDirectory() { return this.directory; }

}