    package ru.rps.notesbook.Domain.Services;

    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;
    import ru.rps.notesbook.API.Contracts.DirectoryContracts;
    import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
    import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
    import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryService;
    import ru.rps.notesbook.Domain.Models.Directory;
    import ru.rps.notesbook.Domain.Models.User;

    import java.time.LocalDateTime;
    import java.util.List;
    import java.util.UUID;

    @Service
    @RequiredArgsConstructor
    public class DirectoryService implements IDirectoryService {

        private final IDirectoryRepository directoryRepository;
        private final IUserRepository userRepository;

        @Override
        @Transactional(readOnly = true)
        public List<DirectoryContracts.DirectoryResponse> GetDirectoriesByOwnerId(UUID ownerId) {
            return directoryRepository.GetDirectoriesByOwnerId(ownerId).stream()
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
            User owner = userRepository.GetUserById(ownerId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Directory directory = new Directory(
                    UUID.randomUUID(),
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

            if (request.title() != null) {
                directory.ChangeTitle(request.title());
            }

            return toResponse(directoryRepository.SaveDirectory(directory));
        }

        @Override
        @Transactional
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