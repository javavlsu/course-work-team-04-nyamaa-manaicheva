package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.PushContracts;

import java.util.UUID;

public interface IPushService {

    // Stage 7.3: обрабатывает батч Push-операций (Note/Directory CREATE/UPDATE/DELETE).
    // Каждая операция обрабатывается независимо - ошибка/конфликт одной не отменяет остальные.
    PushContracts.PushResponse Push(UUID userId, PushContracts.PushRequest request);

}
