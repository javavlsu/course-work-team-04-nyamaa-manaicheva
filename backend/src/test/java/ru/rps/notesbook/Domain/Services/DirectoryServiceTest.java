package ru.rps.notesbook.Domain.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.DirectoryContracts;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IPermissionAccessRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Models.Directory;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DirectoryServiceTest {

    @Mock
    private IDirectoryRepository directoryRepository;
    @Mock
    private IUserRepository userRepository;
    @Mock
    private IPermissionAccessRepository permissionAccessRepository;

    private DirectoryService directoryService;

    private User owner;
    private UUID ownerId;

    @BeforeEach
    void setUp() {
        directoryService = new DirectoryService(directoryRepository, userRepository, permissionAccessRepository);

        ownerId = UUID.randomUUID();
        owner = new User(
                ownerId, "Иван", "Иванов", "ivan@example.com",
                LocalDate.of(1995, 1, 1), LocalDateTime.now(),
                "hashed-password", RoleTypeEnum.Client
        );
    }

    private Directory directoryWith(UUID id, String title, LocalDateTime updatedAt, Long version) {
        return new Directory(id, title, updatedAt.minusDays(1), updatedAt, null, owner, version);
    }

    @Test
    void createDirectory_withValidData_shouldCreateDirectory() {
        when(userRepository.GetUserById(ownerId)).thenReturn(Optional.of(owner));
        when(directoryRepository.SaveDirectory(any(Directory.class))).thenAnswer(inv -> inv.getArgument(0));

        DirectoryContracts.CreateDirectoryRequest request = new DirectoryContracts.CreateDirectoryRequest("Рабочие заметки");

        DirectoryContracts.DirectoryResponse response = directoryService.CreateDirectory(ownerId, request);

        assertNotNull(response.id());
        assertEquals("Рабочие заметки", response.title());
        assertEquals(ownerId, response.ownerId());
        verify(directoryRepository).SaveDirectory(any(Directory.class));
    }

    @Test
    void getDirectoriesByOwnerId_withSearch_shouldReturnFilteredList() {
        LocalDateTime now = LocalDateTime.now();
        Directory matching = directoryWith(UUID.randomUUID(), "Рабочие проекты", now, 1L);
        Directory nonMatching = directoryWith(UUID.randomUUID(), "Личное", now.minusMinutes(1), 1L);

        when(directoryRepository.GetDirectoriesByOwnerId(ownerId)).thenReturn(List.of(matching, nonMatching));
        when(permissionAccessRepository.GetPermissionAccessesByUserId(ownerId)).thenReturn(List.of());

        DirectoryContracts.DirectoryPageResponse page =
                directoryService.GetDirectoriesByOwnerId(ownerId, "рабочие", null, null);

        assertEquals(1, page.items().size());
        assertEquals(matching.GetId(), page.items().get(0).id());
        assertFalse(page.hasMore());
    }

    @Test
    void updateDirectory_withStaleVersion_shouldThrowConflict() {
        UUID directoryId = UUID.randomUUID();
        Directory directory = directoryWith(directoryId, "Старое имя", LocalDateTime.now(), 3L);
        when(directoryRepository.GetDirectoryById(directoryId)).thenReturn(Optional.of(directory));

        DirectoryContracts.UpdateDirectoryRequest request =
                new DirectoryContracts.UpdateDirectoryRequest("Новое имя", 1L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> directoryService.UpdateDirectory(directoryId, request));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(directoryRepository, never()).SaveDirectory(any());
    }

    @Test
    void updateDirectory_withUnknownId_shouldThrowException() {
        UUID directoryId = UUID.randomUUID();
        when(directoryRepository.GetDirectoryById(directoryId)).thenReturn(Optional.empty());

        DirectoryContracts.UpdateDirectoryRequest request =
                new DirectoryContracts.UpdateDirectoryRequest("Новое имя", null);

        assertThrows(RuntimeException.class, () -> directoryService.UpdateDirectory(directoryId, request));
    }

    @Test
    void getDirectoryById_withUnknownId_shouldThrowException() {
        UUID directoryId = UUID.randomUUID();
        when(directoryRepository.GetDirectoryById(directoryId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> directoryService.GetDirectoryById(directoryId));
    }

    @Test
    void deleteDirectoryById_withStaleVersion_shouldThrowConflict() {
        UUID directoryId = UUID.randomUUID();
        Directory directory = directoryWith(directoryId, "Папка", LocalDateTime.now(), 4L);
        when(directoryRepository.GetDirectoryById(directoryId)).thenReturn(Optional.of(directory));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> directoryService.DeleteDirectoryById(directoryId, 2L));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(directoryRepository, never()).SaveDirectory(any());
    }

    @Test
    void getDirectoriesByOwnerId_secondPage_shouldReturnNextItemAndCursor() {
        LocalDateTime now = LocalDateTime.now();
        Directory first = directoryWith(UUID.randomUUID(), "A", now, 1L);
        Directory second = directoryWith(UUID.randomUUID(), "B", now.minusMinutes(1), 1L);
        Directory third = directoryWith(UUID.randomUUID(), "C", now.minusMinutes(2), 1L);

        when(directoryRepository.GetDirectoriesByOwnerId(ownerId)).thenReturn(List.of(first, second, third));
        when(permissionAccessRepository.GetPermissionAccessesByUserId(ownerId)).thenReturn(List.of());

        DirectoryContracts.DirectoryPageResponse firstPage =
                directoryService.GetDirectoriesByOwnerId(ownerId, null, 1, null);

        assertEquals(1, firstPage.items().size());
        assertEquals(first.GetId(), firstPage.items().get(0).id());
        assertTrue(firstPage.hasMore());
        assertNotNull(firstPage.nextCursor());

        DirectoryContracts.DirectoryPageResponse secondPage =
                directoryService.GetDirectoriesByOwnerId(ownerId, null, 1, firstPage.nextCursor());

        assertEquals(1, secondPage.items().size());
        assertEquals(second.GetId(), secondPage.items().get(0).id());
        assertTrue(secondPage.hasMore());
    }

}
