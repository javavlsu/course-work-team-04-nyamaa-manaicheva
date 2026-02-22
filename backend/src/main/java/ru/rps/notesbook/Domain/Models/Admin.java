package ru.rps.notesbook.Domain.Models;

import java.util.UUID;

public class Admin {

    private User user;
    private UUID code;

    public Admin(User user, UUID code)
    {

        // validation

        this.user = user;
        this.code = code;

    }

    public void ChangeUser(User user)
    {
        // validation

        this.user = user;
    }
    public void ChangeCode(UUID code)
    {
        // validation

        this.code = code;
    }

    public User GetUser() { return this.user; }
    public UUID GetCode() { return this.code; }

}