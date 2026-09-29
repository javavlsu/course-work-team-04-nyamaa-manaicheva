package ru.rps.notesbook.API.Contracts;

public final class LogContracts {

    public record LogsResponse(
            boolean available,
            String content
    ) {}

}
