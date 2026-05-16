package ru.rps.notesbook.API.Contracts;

import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public final class UserContracts {

    public record UserResponse(
            UUID id,
            String name,
            String surname,
            String email,
            LocalDate birthdayDate,
            LocalDateTime registrationDate,
            RoleTypeEnum role
    ) {}

    public record UserSummaryResponse(
            UUID id,
            String name,
            String surname,
            String email,
            RoleTypeEnum role
    ) {}

    public record CreateUserRequest(
            String name,
            String surname,
            String email,
            LocalDate birthdayDate,
            String password,
            RoleTypeEnum role
    ) {}

    public record UpdateUserRequest(
            String name,
            String surname,
            String email,
            LocalDate birthdayDate,
            RoleTypeEnum role
    ) {}

    public record ChangePasswordRequest(
            String oldPassword,
            String newPassword
    ) {}
}

