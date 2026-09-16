package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.PushContracts;

import java.util.UUID;

public interface IPushService {

    PushContracts.PushResponse Push(UUID userId, PushContracts.PushRequest request);

}