package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.DirectoryContracts;

import java.util.List;
import java.util.UUID;

public interface IDirectoryService {

    List<DirectoryContracts.DirectoryResponse> GetDirectoriesByOwnerId(UUID ownerId);

    DirectoryContracts.DirectoryResponse GetDirectoryById(UUID id);

    DirectoryContracts.DirectoryResponse CreateDirectory(UUID ownerId, String title);

    void DeleteDirectoryById(UUID id);

}