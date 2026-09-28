package ru.rps.notesbook.Domain.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.AdminContracts;
import ru.rps.notesbook.API.Contracts.UserContracts;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Storage.IFileStorageService;
import ru.rps.notesbook.Domain.Models.User;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private IUserRepository userRepository;
    @Mock
    private IFileStorageService fileStorageService;
    @Mock
    private PasswordEncoder passwordEncoder;

    @TempDir
    Path logDir;

    private AdminService adminService;

    @BeforeEach
    void setUp() {
        adminService = new AdminService(userRepository, fileStorageService, passwordEncoder, logDir.toString());
    }

    @Test
    void createUser_withAdminRole_shouldSaveAdmin() {
        when(userRepository.GetUserByEmail("boss@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.SaveUser(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserContracts.UserResponse response = adminService.CreateUser(new UserContracts.CreateUserRequest(
                " Анна ", "Петрова", " Boss@Example.com ", null, "password123", RoleTypeEnum.Admin));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).SaveUser(captor.capture());
        assertEquals(RoleTypeEnum.Admin, captor.getValue().GetRole());
        assertEquals("hashed", captor.getValue().GetPassword());
        assertEquals("boss@example.com", response.email());
        assertEquals("Анна", response.name());
        assertEquals(RoleTypeEnum.Admin, response.role());
    }

    @Test
    void createUser_withDuplicateEmail_shouldThrowIllegalArgument() {
        when(userRepository.GetUserByEmail("ivan@example.com")).thenReturn(Optional.of(existingUser()));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> adminService.CreateUser(new UserContracts.CreateUserRequest(
                        "Иван", "Иванов", "ivan@example.com", null, "password123", RoleTypeEnum.Client)));

        assertEquals("Пользователь с таким email уже зарегистрирован", ex.getMessage());
        verify(userRepository, never()).SaveUser(any());
    }

    @Test
    void createUser_withoutRole_shouldThrowValidationException() {
        when(userRepository.GetUserByEmail("ivan@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashed");

        assertThrows(IllegalArgumentException.class,
                () -> adminService.CreateUser(new UserContracts.CreateUserRequest(
                        "Иван", "Иванов", "ivan@example.com", null, "password123", null)));
        verify(userRepository, never()).SaveUser(any());
    }

    @Test
    void createUser_withBlankName_shouldThrowIllegalArgument() {
        assertThrows(IllegalArgumentException.class,
                () -> adminService.CreateUser(new UserContracts.CreateUserRequest(
                        "  ", "Иванов", "ivan@example.com", null, "password123", RoleTypeEnum.Client)));
        verify(userRepository, never()).SaveUser(any());
    }

    @Test
    void deleteUserWithAllData_shouldRemoveDataThenStorageObjects() {
        UUID targetId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        when(userRepository.GetUserById(targetId)).thenReturn(Optional.of(existingUser()));
        when(userRepository.DeleteUserWithAllData(targetId)).thenReturn(List.of("attachments/a", "attachments/b"));

        adminService.DeleteUserWithAllData(targetId, actorId);

        verify(userRepository).DeleteUserWithAllData(targetId);
        verify(fileStorageService).Delete("attachments/a");
        verify(fileStorageService).Delete("attachments/b");
    }

    @Test
    void deleteUserWithAllData_whenStorageFails_shouldStillComplete() {
        UUID targetId = UUID.randomUUID();
        when(userRepository.GetUserById(targetId)).thenReturn(Optional.of(existingUser()));
        when(userRepository.DeleteUserWithAllData(targetId)).thenReturn(List.of("attachments/a", "attachments/b"));
        doThrow(new RuntimeException("s3 down")).when(fileStorageService).Delete("attachments/a");

        adminService.DeleteUserWithAllData(targetId, UUID.randomUUID());

        verify(fileStorageService, times(2)).Delete(any());
    }

    @Test
    void deleteUserWithAllData_ownAccount_shouldThrowForbidden() {
        UUID id = UUID.randomUUID();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> adminService.DeleteUserWithAllData(id, id));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(userRepository, never()).DeleteUserWithAllData(any());
    }

    @Test
    void deleteUserWithAllData_withUnknownId_shouldThrowNotFound() {
        UUID targetId = UUID.randomUUID();
        when(userRepository.GetUserById(targetId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> adminService.DeleteUserWithAllData(targetId, UUID.randomUUID()));

        assertEquals("User not found", ex.getMessage());
        verify(userRepository, never()).DeleteUserWithAllData(any());
    }

    @Test
    void getLogs_withoutLogFile_shouldReturnUnavailable() {
        AdminContracts.LogsResponse response = adminService.GetLogs(null);

        assertFalse(response.available());
        assertEquals("", response.content());
    }

    @Test
    void getLogs_shouldReturnOnlyRequestedTailLines() throws IOException {
        writeLog(IntStream.rangeClosed(1, 10).mapToObj(i -> "line " + i).collect(Collectors.joining("\n")) + "\n");

        AdminContracts.LogsResponse response = adminService.GetLogs(3);

        assertTrue(response.available());
        assertEquals("line 8\nline 9\nline 10", response.content());
    }

    @Test
    void getLogs_withoutLimit_shouldReturnWholeSmallFile() throws IOException {
        writeLog("first\nsecond\n");

        AdminContracts.LogsResponse response = adminService.GetLogs(null);

        assertEquals("first\nsecond", response.content());
    }

    @Test
    void getLogs_withEmptyFile_shouldReturnEmptyContent() throws IOException {
        writeLog("");

        AdminContracts.LogsResponse response = adminService.GetLogs(100);

        assertTrue(response.available());
        assertEquals("", response.content());
    }

    private void writeLog(String content) throws IOException {
        Files.writeString(logDir.resolve("notesbook.log"), content);
    }

    private User existingUser() {
        return new User(
                UUID.randomUUID(), "Иван", "Иванов", "ivan@example.com",
                LocalDate.of(1995, 1, 1), LocalDateTime.now(),
                "hashed-password", RoleTypeEnum.Client
        );
    }

}
