package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.rps.notesbook.API.Contracts.DirectoryContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryService;
import ru.rps.notesbook.Domain.Models.Directory;
import ru.rps.notesbook.Domain.Models.User;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DirectoryService implements IDirectoryService {

    private final IDirectoryRepository directoryRepository;
    private final IUserRepository userRepository;

    @Override
    public List<DirectoryContracts.DirectoryResponse> GetDirectoriesByOwnerId(UUID ownerId) {
        return directoryRepository.GetDirectoriesByOwnerId(ownerId).stream()
                .map(DirectoryService::toResponse)
                .toList();
    }

    @Override
    public DirectoryContracts.DirectoryResponse GetDirectoryById(UUID id) {
        return toResponse(directoryRepository.GetDirectoryById(id)
                .orElseThrow(() -> new RuntimeException("Directory not found")));
    }

    @Override
    public DirectoryContracts.DirectoryResponse CreateDirectory(UUID ownerId, String title) {
        User owner = userRepository.GetUserById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Directory directory = new Directory(
                UUID.randomUUID(),
                title, owner
        );

        return toResponse(directoryRepository.SaveDirectory(directory));
    }

    @Override
    public void DeleteDirectoryById(UUID id) {
        directoryRepository.DeleteDirectoryById(id);
    }

    private static DirectoryContracts.DirectoryResponse toResponse(Directory d) {
        return new DirectoryContracts.DirectoryResponse(
                d.GetId(),
                d.GetTitle(),
                d.GetCreatedDate(),
                d.GetOwner().GetId()
        );
    }
}