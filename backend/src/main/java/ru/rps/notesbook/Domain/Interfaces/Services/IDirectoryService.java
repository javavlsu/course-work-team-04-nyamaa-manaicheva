package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.DirectoryContracts;

import java.util.List;
import java.util.UUID;

public interface IDirectoryService {

    List<DirectoryContracts.DirectoryResponse> GetDirectoriesByOwnerId(UUID ownerId);

    DirectoryContracts.DirectoryResponse GetDirectoryById(UUID id);

    DirectoryContracts.DirectoryResponse CreateDirectory(UUID ownerId, DirectoryContracts.CreateDirectoryRequest request);

    // Stage 7.3: Push Sync - создание с client-generated UUID (offline-first). Обычный
    // CreateDirectory(ownerId, request) продолжает работать как раньше.
    DirectoryContracts.DirectoryResponse CreateDirectory(UUID id, UUID ownerId, DirectoryContracts.CreateDirectoryRequest request);

    DirectoryContracts.DirectoryResponse UpdateDirectory(UUID id, DirectoryContracts.UpdateDirectoryRequest request);

    void DeleteDirectoryById(UUID id);

    // Stage 7.3: Push Sync - удаление с optimistic-lock проверкой. expectedVersion nullable:
    // null -> поведение как у обычного DeleteDirectoryById(id) (обратная совместимость).
    void DeleteDirectoryById(UUID id, Long expectedVersion);

}