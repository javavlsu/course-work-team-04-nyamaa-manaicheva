package ru.rps.notesbook.API.Contracts;

import java.util.UUID;

public final class AdminContracts {

    public record AdminResponse(
            UserContracts.UserResponse user,
            UUID code
    ) {}

    public record CreateAdminRequest(
            UUID userId,
            UUID code
    ) {}

    public record UpdateAdminRequest(
            UUID code
    ) {}
}

