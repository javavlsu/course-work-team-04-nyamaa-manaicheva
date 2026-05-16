package ru.rps.notesbook.API.Contracts;

import java.time.LocalDate;
import java.util.UUID;

public final class AuthContracts {

    public record LoginRequest(
            String email,
            String password
    ) {}

    public record RegisterRequest(
            String name,
            String surname,
            String email,
            LocalDate birthdayDate,
            String password,
            String passwordConfirm
    ) {}

    public record LoginResponse(
            UUID userId,
            String email
    ) {}
}
