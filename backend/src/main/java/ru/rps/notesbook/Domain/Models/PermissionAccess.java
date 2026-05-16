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
                            User user, Directory directory) {

        ValidatePermissionType(type);

        this.id = id;
        this.type = type;
        this.note = note;
        this.user = user;
        this.directory = directory;
    }

    public UUID GetId() { return this.id; }
    public PermissionTypeEnum GetAccessType() { return this.type; }
    public Note GetNote() { return this.note; }
    public User GetUser() { return this.user; }
    public Directory GetDirectory() { return this.directory; }

    public void ChangePermissionType(PermissionTypeEnum type) {
        ValidatePermissionType(type);
        this.type = type;
    }
    public void ChangeNote(Note note) {
        this.note = note;
    }
    public void ChangeUser(User user) {
        this.user = user;
    }
    public void ChangeDirectory(Directory directory) {
        this.directory = directory;
    }

    public void ValidatePermissionType(PermissionTypeEnum type) {
        if (type == null) {
            throw new IllegalArgumentException("permission type can't be null");
        }
        if (type != PermissionTypeEnum.View && type != PermissionTypeEnum.Edit) {
            throw new IllegalArgumentException("permission type is not valid");
        }
    }
    public void ValidateNote(Note note) {
        if (note == null) {
            throw new IllegalArgumentException("note can't be null");
        }
    }
    public void ValidateUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("user can't be null");
        }
    }
    public void ValidateDirectory(Directory directory) {
        if (directory == null) {
            throw new IllegalArgumentException("directory can't be null");
        }
    }

}