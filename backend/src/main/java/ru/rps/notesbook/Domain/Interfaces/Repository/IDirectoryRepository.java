package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.Directory;

import java.util.List;
import java.util.UUID;

@Repository
public interface IDirectoryRepository {
    List<Directory> GetDirectoriesByUserIdAsync(UUID userId);
    Directory GetDirectoryByIdAsync(UUID id);
    Directory CreateDirectoryAsync(Directory directory);
    Directory UpdateDirectoryAsync(Directory directory);
    void DeleteDirectoryByIdAsync(UUID id);
}
