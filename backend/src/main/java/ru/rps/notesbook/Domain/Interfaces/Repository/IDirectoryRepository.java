package ru.rps.notesbook.Domain.Interfaces.Repository;

import org.springframework.stereotype.Repository;
import ru.rps.notesbook.Domain.Models.Directory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IDirectoryRepository {
    List<Directory> GetDirectoriesByOwnerId(UUID ownerId);
    Optional<Directory> GetDirectoryById(UUID id);
    Directory SaveDirectory(Directory directory);
    void DeleteDirectoryById(UUID id);

    // Stage 7.1: для pull-синхронизации. Soft-deleted Directory также должна попадать в результат.
    List<Directory> GetDirectoriesUpdatedAfter(LocalDateTime timestamp);
}
