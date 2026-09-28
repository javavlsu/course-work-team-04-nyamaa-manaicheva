package ru.rps.notesbook.API.Contracts;

public final class AdminContracts {

    public record LogsResponse(
            boolean available,
            String content
    ) {}

}