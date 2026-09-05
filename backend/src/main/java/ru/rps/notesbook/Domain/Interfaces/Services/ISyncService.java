package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.SyncContracts;

import java.util.UUID;

public interface ISyncService {

    SyncContracts.SyncResponse Sync(UUID userId, SyncContracts.SyncRequest request);

}