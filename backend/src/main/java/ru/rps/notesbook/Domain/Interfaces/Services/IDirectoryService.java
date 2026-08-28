package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.DirectoryContracts;

import java.util.List;
import java.util.UUID;

public interface IDirectoryService {

    List<DirectoryContracts.DirectoryResponse> GetDirectoriesByOwnerId(UUID ownerId);

    DirectoryContracts.DirectoryResponse GetDirectoryById(UUID id);

    DirectoryContracts.DirectoryResponse CreateDirectory(UUID ownerId, DirectoryContracts.CreateDirectoryRequest request);

    // for push sync only with client-generated UUID
    DirectoryContracts.DirectoryResponse CreateDirectory(UUID id, UUID ownerId, DirectoryContracts.CreateDirectoryRequest request);

    DirectoryContracts.DirectoryResponse UpdateDirectory(UUID id, DirectoryContracts.UpdateDirectoryRequest request);

    void DeleteDirectoryById(UUID id);

    void DeleteDirectoryById(UUID id, Long expectedVersion);

}