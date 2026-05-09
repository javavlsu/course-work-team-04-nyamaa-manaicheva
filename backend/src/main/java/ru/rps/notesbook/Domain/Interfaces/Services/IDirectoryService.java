package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.Domain.Models.Directory;

import java.util.List;
import java.util.UUID;

public interface IDirectoryService {
    List<Directory> GetDirectoriesByOwnerId(UUID ownerId);
    Directory GetDirectoryById(UUID id);
    Directory SaveDirectory(Directory directory);
    void DeleteDirectoryById(UUID id);
}
