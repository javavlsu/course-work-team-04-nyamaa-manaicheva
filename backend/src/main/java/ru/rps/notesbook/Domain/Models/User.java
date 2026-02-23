package ru.rps.notesbook.Domain.Models;

import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class User {

    private final UUID id;
    private String name;
    private String surname;
    private String email;
    private LocalDate birthdayDate;
    private final LocalDateTime registrationDate = LocalDateTime.now();
    private String password;
    private RoleTypeEnum role;

    public User(UUID id,String name, String surname, String email,
                LocalDate birthdayDate, String password, RoleTypeEnum role)
    {

        // validation in the future

        this.id = id;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.birthdayDate = birthdayDate; // could be null
        this.password = password;
        this.role = role;
    }

    public void ChangeName(String name) {
        // validation

        this.name = name;
    }
    public void ChangeSurname(String surname) {
        // validation

        this.surname = surname;
    }
    public void ChangeEmail(String email) {
        // validation

        this.email = email;
    }
    public void GetBirthdayDate(LocalDate birthdayDate) {
        // validation

        this.birthdayDate = birthdayDate;
    }
    public void ChangePassword(String password) {
        // validation

        this.password = password;
    }
    public void ChangeRole(RoleTypeEnum role)
    {
        // validation

        this.role = role;
    }

    public UUID GetId() { return this.id; }
    public String GetName() { return this.name; }
    public String GetSurname() { return this.surname; }
    public String GetEmail() { return this.email; }
    public LocalDate GetBirthdayDate() { return this.birthdayDate; }
    public LocalDateTime GetRegistrationDate() { return this.registrationDate; }
    public String GetPassword() { return this.password; }
    public RoleTypeEnum GetRole() { return this.role; }

}