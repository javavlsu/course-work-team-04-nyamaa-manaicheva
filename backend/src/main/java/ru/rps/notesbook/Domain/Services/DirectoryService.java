package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryService;
import ru.rps.notesbook.Domain.Models.Directory;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DirectoryService implements IDirectoryService {

    private final IDirectoryRepository directoryRepository;

    @Override
    public List<Directory> GetDirectoriesByOwnerId(UUID ownerId) {
        return directoryRepository.GetDirectoriesByOwnerId(ownerId);
    }

    @Override
    public Directory GetDirectoryById(UUID id) {
        return directoryRepository.GetDirectoryById(id)
                .orElseThrow(() -> new RuntimeException("Directory not found"));
    }

    @Override
    public Directory SaveDirectory(Directory directory) {
        return directoryRepository.SaveDirectory(directory);
    }

    @Override
    public void DeleteDirectoryById(UUID id) {
        directoryRepository.DeleteDirectoryById(id);
    }

}