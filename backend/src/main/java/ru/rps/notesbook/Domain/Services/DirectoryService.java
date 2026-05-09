package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryService;
import ru.rps.notesbook.Domain.Models.Directory;
import ru.rps.notesbook.Domain.Models.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DirectoryService implements IDirectoryService {

    private final IDirectoryRepository directoryRepository;
    private final IUserRepository userRepository;

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
    public Directory CreateDirectoryForOwner(UUID ownerId, String title) {
        User owner = userRepository.GetUserById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Directory directory = new Directory(UUID.randomUUID(), title, owner);
        return directoryRepository.SaveDirectory(directory);
    }

    @Override
    public void DeleteDirectoryById(UUID id) {
        directoryRepository.DeleteDirectoryById(id);
    }

}