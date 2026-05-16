package ru.rps.notesbook.Domain.Models;

import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.regex.Pattern;
import java.util.UUID;

public class User {

    private final UUID id;
    private String name;
    private String surname;
    private String email;
    private LocalDate birthdayDate;
    private final LocalDateTime registrationDate;
    private String password;
    private RoleTypeEnum role;

    public User(UUID id, String name, String surname, String email,
                LocalDate birthdayDate, LocalDateTime registrationDate,
                String password, RoleTypeEnum role) {
                    
        ValidateName(name);
        ValidateSurname(surname);
        ValidateEmail(email);
        ValidateBirthdayDate(birthdayDate);
        ValidatePassword(password);
        ValidateRole(role);

        this.id = id;
        this.name = name;
        this.surname = surname;
        this.email = email.trim().toLowerCase();
        this.birthdayDate = birthdayDate;
        this.registrationDate = registrationDate;
        this.password = password;
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

    public void ChangeName(String name) {
        ValidateName(name);
        this.name = name;
    }
    public void ChangeSurname(String surname) {
        ValidateSurname(surname);
        this.surname = surname;
    }
    public void ChangeEmail(String email) {
        ValidateEmail(email);
        this.email = email.toLowerCase();
    }
    public void ChangeBirthdayDate(LocalDate birthdayDate) {
        ValidateBirthdayDate(birthdayDate);
        this.birthdayDate = birthdayDate;
    }
    public void ChangePassword(String password) {
        ValidatePassword(password);
        this.password = password;
    }
    public void ChangeRole(RoleTypeEnum role) {
        ValidateRole(role);
        this.role = role;
    }

    public void ValidateName(String name) {
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("name can't be null or empty");
        }
        if (name.strip().length() > 75) {
            throw new IllegalArgumentException("name is too long");
        }
    }
    public void ValidateSurname(String surname) {
            if (surname == null || surname.isEmpty()) {
            throw new IllegalArgumentException("second name can't be null or empty");
        }
        if (surname.strip().length() > 75) {
            throw new IllegalArgumentException("second name is too long");
        }
    }
    public void ValidateEmail(String email) {
        Pattern emailPattern = Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("email can't be null or empty");
        }
        if (!emailPattern.matcher(email).matches()) {
            throw new IllegalArgumentException("email is not valid");
        }
    }
    public void ValidateBirthdayDate(LocalDate birthdayDate) {
        if (birthdayDate != null && birthdayDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("birthday date is in the future");
        }
    }
    public void ValidatePassword(String password) {
        if (password == null || password.isEmpty()) {
            throw new IllegalArgumentException("password can't be null or empty");
        }
        if (password.length() > 100) {
            throw new IllegalArgumentException("password is too long");
        }
    }
    public void ValidateRole(RoleTypeEnum role) {
        if (role == null) {
            throw new IllegalArgumentException("role can't be null");
        }
        if (role != RoleTypeEnum.Admin && role != RoleTypeEnum.Client) {
            throw new IllegalArgumentException("role is not valid");
        }
    }
    
}