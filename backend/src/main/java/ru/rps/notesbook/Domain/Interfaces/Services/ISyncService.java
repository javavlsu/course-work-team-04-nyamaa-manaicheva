package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.SyncContracts;

import java.util.UUID;

public interface ISyncService {

    // Stage 7.2: базовая pull-синхронизация. Возвращает изменения (включая soft-delete
    // tombstones) по Note/Directory/DirectoryNote, доступные userId начиная с lastSyncAt,
    // а также полный набор доступных Note/Directory ID для обнаружения revoke на клиенте.
    SyncContracts.SyncResponse Sync(UUID userId, SyncContracts.SyncRequest request);

}
