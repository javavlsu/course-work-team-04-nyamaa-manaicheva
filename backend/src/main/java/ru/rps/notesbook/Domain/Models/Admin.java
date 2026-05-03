package ru.rps.notesbook.Domain.Models;

import java.util.UUID;

public class Admin {

    private User user;
    private UUID code;

    public Admin(User user, UUID code) {
        ValidateUser(user);
        ValidateCode(code);

        this.user = user;
        this.code = code;
    }

    public User GetUser() { return this.user; }
    public UUID GetCode() { return this.code; }

    public void ChangeUser(User user) {
        ValidateUser(user);
        this.user = user;
    }
    public void ChangeCode(UUID code) {
        ValidateCode(code);
        this.code = code;
    }

    public void ValidateUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("user can't be null");
        }
    }
    public void ValidateCode(UUID code) {
        if (code == null) {
            throw new IllegalArgumentException("code can't be null");
        }
    }

}