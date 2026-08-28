package ru.rps.notesbook.Domain.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.DirectoryContracts;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IPermissionAccessRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryService;
import ru.rps.notesbook.Domain.Models.Directory;
import ru.rps.notesbook.Domain.Models.PermissionAccess;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DirectoryService implements IDirectoryService {

    private final IDirectoryRepository directoryRepository;
    private final IUserRepository userRepository;
    private final IPermissionAccessRepository permissionAccessRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DirectoryContracts.DirectoryResponse> GetDirectoriesByOwnerId(UUID ownerId) {
        Map<UUID, Directory> directories = new LinkedHashMap<>();

        // Собственные Directories
        for (Directory directory : directoryRepository.GetDirectoriesByOwnerId(ownerId)) {
            directories.putIfAbsent(directory.GetId(), directory);
        }

        // Directories доступные по PermissionAccess
        for (PermissionAccess permission : permissionAccessRepository.GetPermissionAccessesByUserId(ownerId)) {
            if (permission.GetDirectory() == null) {
                continue;
            }
            directoryRepository.GetDirectoryById(permission.GetDirectory().GetId())
                    .ifPresent(directory -> directories.putIfAbsent(directory.GetId(), directory));
        }

        return directories.values().stream()
                .map(DirectoryService::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DirectoryContracts.DirectoryResponse GetDirectoryById(UUID id) {
        return toResponse(directoryRepository.GetDirectoryById(id)
                .orElseThrow(() -> new RuntimeException("Directory not found")));
    }

    @Override
    @Transactional
    public DirectoryContracts.DirectoryResponse CreateDirectory(UUID ownerId, DirectoryContracts.CreateDirectoryRequest request) {
        return CreateDirectory(UUID.randomUUID(), ownerId, request);
    }

    // Stage 7.3: Push Sync - id приходит от клиента (offline-generated), вместо UUID.randomUUID().
    // Проверка "такой id уже существует" — ответственность вызывающей стороны (PushService).
    @Override
    @Transactional
    public DirectoryContracts.DirectoryResponse CreateDirectory(UUID id, UUID ownerId, DirectoryContracts.CreateDirectoryRequest request) {
        User owner = userRepository.GetUserById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Directory directory = new Directory(
                id,
                request.title(),
                LocalDateTime.now(),
                owner
        );

        return toResponse(directoryRepository.SaveDirectory(directory));
    }

    @Override
    @Transactional
    public DirectoryContracts.DirectoryResponse UpdateDirectory(UUID id, DirectoryContracts.UpdateDirectoryRequest request) {
        Directory directory = directoryRepository.GetDirectoryById(id)
                .orElseThrow(() -> new RuntimeException("Directory not found"));

        // Optimistic-locking фундамент для будущего Sync (Stage 7.0), аналогично Note.
        if (request.expectedVersion() != null && !request.expectedVersion().equals(directory.GetVersion())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Resource was modified by another client (currentVersion=" + directory.GetVersion() + ")");
        }

        if (request.title() != null) {
            directory.ChangeTitle(request.title());
        }

        return toResponse(directoryRepository.SaveDirectory(directory));
    }

    @Override
    @Transactional
    public void DeleteDirectoryById(UUID id) {
        DeleteDirectoryById(id, null);
    }

    // Stage 7.3: Push Sync - optimistic-lock проверка при удалении, аналогично UpdateDirectory.
    // expectedVersion == null -> проверка пропускается (обратная совместимость).
    @Override
    @Transactional
    public void DeleteDirectoryById(UUID id, Long expectedVersion) {
        Directory directory = directoryRepository.GetDirectoryById(id)
                .orElseThrow(() -> new RuntimeException("Directory not found"));

        if (expectedVersion != null && !expectedVersion.equals(directory.GetVersion())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Resource was modified by another client (currentVersion=" + directory.GetVersion() + ")");
        }

        directory.MarkDeleted();

        directoryRepository.SaveDirectory(directory);
    }

    private static DirectoryContracts.DirectoryResponse toResponse(Directory d) {
        return new DirectoryContracts.DirectoryResponse(
                d.GetId(),
                d.GetTitle(),
                d.GetCreatedDate(),
                d.GetOwner().GetId(),
                d.GetUpdatedAt(),
                d.GetDeletedAt(),
                d.GetVersion()
        );
    }
    
}