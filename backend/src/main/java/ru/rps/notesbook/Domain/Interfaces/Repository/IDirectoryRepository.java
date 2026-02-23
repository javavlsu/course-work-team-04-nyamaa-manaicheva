package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.Directory;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IDirectoryRepository {
    List<Directory> GetDirectoriesByUserId(UUID userId);
    Optional<Directory> GetDirectoryById(UUID id);
    Directory SaveDirectory(Directory directory);
    void DeleteDirectoryById(UUID id);
}
