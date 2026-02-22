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
}