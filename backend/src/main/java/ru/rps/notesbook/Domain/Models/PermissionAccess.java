package ru.rps.notesbook.Domain.Models;

import ru.rps.notesbook.Domain.Enum.PermissionTypeEnum;

import java.util.UUID;

public class PermissionAccess {

    private final UUID id;
    private PermissionTypeEnum type;
    private Note note;
    private User user;
    private Directory directory;

    public PermissionAccess(UUID id, PermissionTypeEnum type, Note note,
                            User user, Directory directory)
    {
        // validation

        this.id = id;
        this.type = type;
        this.note = note;
        this.user = user;
        this.directory = directory;
    }

    public void ChangePermissionType(PermissionTypeEnum type)
    {
        // validation

        this.type = type;
    }
    public void ChangeNote(Note note){
        // validation

        this.note = note;
    }
    public void ChangeUser(User user){
        // validation

        this.user = user;
    }
    public void ChangeDirectory(Directory directory)
    {
        // validation

        this.directory = directory;
    }

    public UUID GetId() { return this.id; }
    public PermissionTypeEnum GetAccessType() { return this.type; }
    public Note GetNote() { return this.note; }
    public User GetUser() { return this.user; }
    public Directory GetDirectory() { return this.directory; }

}