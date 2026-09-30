package ru.rps.notesbook.Domain.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import ru.rps.notesbook.API.Contracts.UserContracts;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Interfaces.Services.IEmailService;
import ru.rps.notesbook.Domain.Interfaces.Storage.IFileStorageService;
import ru.rps.notesbook.Domain.Models.User;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private IUserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private IEmailService emailService;
    @Mock
    private IFileStorageService fileStorageService;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder, emailService, fileStorageService);
    }

    @Test
    void register_withValidData_shouldCreateUserWithClientRole() {
        when(userRepository.GetUserByEmail("ivan@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password123");
        when(userRepository.SaveUser(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        userService.register("Иван", "Иванов", "ivan@example.com",
                LocalDate.of(1995, 1, 1), "password123");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).SaveUser(captor.capture());
        User saved = captor.getValue();
        assertEquals("ivan@example.com", saved.GetEmail());
        assertEquals(RoleTypeEnum.Client, saved.GetRole());
        assertEquals("hashed-password123", saved.GetPassword());
    }

    @Test
    void register_withDuplicateEmail_shouldThrowIllegalArgumentException() {
        when(userRepository.GetUserByEmail("ivan@example.com"))
                .thenReturn(Optional.of(existingUser()));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.register("Иван", "Иванов", "ivan@example.com",
                        LocalDate.of(1995, 1, 1), "password123"));
        assertEquals("Пользователь с таким email уже зарегистрирован", ex.getMessage());
        verify(userRepository, never()).SaveUser(any());
    }

    @Test
    void register_withInvalidEmailFormat_shouldThrowValidationException() {
        when(userRepository.GetUserByEmail("not-an-email")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");

        assertThrows(IllegalArgumentException.class,
                () -> userService.register("Иван", "Иванов", "not-an-email",
                        LocalDate.of(1995, 1, 1), "password123"));
        verify(userRepository, never()).SaveUser(any());
    }

    @Test
    void register_withFutureBirthday_shouldThrowValidationException() {
        when(userRepository.GetUserByEmail("ivan@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");

        assertThrows(IllegalArgumentException.class,
                () -> userService.register("Иван", "Иванов", "ivan@example.com",
                        LocalDate.now().plusDays(1), "password123"));
        verify(userRepository, never()).SaveUser(any());
    }

    @Test
    void register_withTooLongName_shouldThrowValidationException() {
        when(userRepository.GetUserByEmail("ivan@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        String tooLongName = "И".repeat(76);

        assertThrows(IllegalArgumentException.class,
                () -> userService.register(tooLongName, "Иванов", "ivan@example.com",
                        LocalDate.of(1995, 1, 1), "password123"));
        verify(userRepository, never()).SaveUser(any());
    }

    @Test
    void register_withTooLongPassword_shouldThrowValidationException() {
        when(userRepository.GetUserByEmail("ivan@example.com")).thenReturn(Optional.empty());
        String tooLongPassword = "a".repeat(101);
        when(passwordEncoder.encode(tooLongPassword)).thenReturn(tooLongPassword);

        assertThrows(IllegalArgumentException.class,
                () -> userService.register("Иван", "Иванов", "ivan@example.com",
                        LocalDate.of(1995, 1, 1), tooLongPassword));
        verify(userRepository, never()).SaveUser(any());
    }

    @Test
    void requestPasswordReset_forExistingEmail_shouldGenerateTokenAndSendEmail() {
        User user = existingUser();
        when(userRepository.GetUserByEmail("ivan@example.com")).thenReturn(Optional.of(user));
        when(userRepository.SaveUser(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        userService.RequestPasswordReset("ivan@example.com");

        assertTrue(user.GetPasswordResetTokenHash() != null && !user.GetPasswordResetTokenHash().isBlank());
        verify(emailService, times(1)).SendPasswordResetEmail(eqIgnoreCase("ivan@example.com"), anyString());
        verify(userRepository, times(1)).SaveUser(user);
    }

    @Test
    void requestPasswordReset_forNonExistingEmail_shouldDoNothingSilently() {
        when(userRepository.GetUserByEmail("unknown@example.com")).thenReturn(Optional.empty());

        userService.RequestPasswordReset("unknown@example.com");

        verify(emailService, never()).SendPasswordResetEmail(anyString(), anyString());
        verify(userRepository, never()).SaveUser(any());
    }

    @Test
    void resetPassword_withValidToken_shouldUpdatePasswordAndClearToken() {
        String rawToken = "valid-raw-token";
        String tokenHash = sha256Hex(rawToken);

        User user = existingUser();
        user.SetPasswordResetToken(tokenHash, LocalDateTime.now().plusMinutes(10));

        when(userRepository.GetUserByPasswordResetTokenHash(tokenHash)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPassword123")).thenReturn("hashed-newPassword123");
        when(userRepository.SaveUser(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        userService.ResetPassword(rawToken, "newPassword123");

        assertEquals("hashed-newPassword123", user.GetPassword());
        assertEquals(null, user.GetPasswordResetTokenHash());
        verify(userRepository, times(1)).SaveUser(user);
    }

    @Test
    void resetPassword_withUnknownToken_shouldThrowIllegalArgumentException() {
        when(userRepository.GetUserByPasswordResetTokenHash(anyString())).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.ResetPassword("some-token", "newPassword123"));
        assertEquals("Недействительный токен восстановления", ex.getMessage());
        verify(userRepository, never()).SaveUser(any());
    }

    @Test
    void resetPassword_withExpiredToken_shouldClearTokenAndThrow() {
        String rawToken = "expired-raw-token";
        String tokenHash = sha256Hex(rawToken);

        User user = existingUser();
        user.SetPasswordResetToken(tokenHash, LocalDateTime.now().minusMinutes(1));

        when(userRepository.GetUserByPasswordResetTokenHash(tokenHash)).thenReturn(Optional.of(user));
        when(userRepository.SaveUser(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.ResetPassword(rawToken, "newPassword123"));
        assertEquals("Срок действия токена истёк", ex.getMessage());
        assertEquals(null, user.GetPasswordResetTokenHash());
        verify(userRepository, times(1)).SaveUser(user);
    }

    @Test
    void searchUsers_byPartialMatch_shouldReturnMatchingUsers() {
        User ivan = existingUser();
        User petr = new User(UUID.randomUUID(), "Пётр", "Петров", "petr@example.com",
                LocalDate.of(1996, 2, 2), LocalDateTime.now(), "hash", RoleTypeEnum.Client);
        when(userRepository.GetUsers()).thenReturn(List.of(ivan, petr));

        List<UserContracts.UserSearchResponse> result = userService.SearchUsers("petr");

        assertEquals(1, result.size());
        assertEquals(petr.GetId(), result.get(0).id());
    }

    @Test
    void searchUsers_withBlankQuery_shouldReturnEmptyList() {
        List<UserContracts.UserSearchResponse> result = userService.SearchUsers("   ");

        assertTrue(result.isEmpty());
        verify(userRepository, never()).GetUsers();
    }

    @Test
    void getUserById_withUnknownId_shouldThrowException() {
        UUID id = UUID.randomUUID();
        when(userRepository.GetUserById(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.GetUserById(id));
    }

    @Test
    void updateUser_withPartialData_shouldUpdateOnlyProvidedFields() {
        User user = existingUser();
        when(userRepository.GetUserById(user.GetId())).thenReturn(Optional.of(user));
        when(userRepository.SaveUser(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserContracts.UpdateUserRequest request = new UserContracts.UpdateUserRequest(
                "Иван-обновлённый", null, null, null, null);

        UserContracts.UserResponse response = userService.UpdateUser(user.GetId(), request);

        assertEquals("Иван-обновлённый", response.name());
        assertEquals("Иванов", response.surname());
        assertEquals("ivan@example.com", response.email());
    }

    @Test
    void updateUser_withInvalidEmail_shouldThrowValidationException() {
        User user = existingUser();
        when(userRepository.GetUserById(user.GetId())).thenReturn(Optional.of(user));

        UserContracts.UpdateUserRequest request = new UserContracts.UpdateUserRequest(
                null, null, "not-an-email", null, null);

        assertThrows(IllegalArgumentException.class, () -> userService.UpdateUser(user.GetId(), request));
        verify(userRepository, never()).SaveUser(any());
    }

    @Test
    void updateUser_withBlankName_shouldThrowValidationException() {
        User user = existingUser();
        when(userRepository.GetUserById(user.GetId())).thenReturn(Optional.of(user));

        UserContracts.UpdateUserRequest request = new UserContracts.UpdateUserRequest(
                "", null, null, null, null);

        assertThrows(IllegalArgumentException.class, () -> userService.UpdateUser(user.GetId(), request));
        verify(userRepository, never()).SaveUser(any());
    }

    @Test
    void updateUser_withUnknownId_shouldThrowException() {
        UUID id = UUID.randomUUID();
        when(userRepository.GetUserById(id)).thenReturn(Optional.empty());

        UserContracts.UpdateUserRequest request = new UserContracts.UpdateUserRequest(
                "Имя", null, null, null, null);

        assertThrows(RuntimeException.class, () -> userService.UpdateUser(id, request));
    }

    @Test
    void changeUserRole_withNullRole_shouldThrowValidationException() {
        User user = existingUser();
        when(userRepository.GetUserById(user.GetId())).thenReturn(Optional.of(user));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.ChangeUserRole(user.GetId(), null));
        assertEquals("role can't be null", ex.getMessage());
        verify(userRepository, never()).SaveUser(any());
    }

    @Test
    void changeUserRole_withUnknownId_shouldThrowException() {
        UUID id = UUID.randomUUID();
        when(userRepository.GetUserById(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.ChangeUserRole(id, RoleTypeEnum.Admin));
    }

    @Test
    void deleteUserById_shouldDeleteUserAndRemoveStorageObjects() {
        User user = existingUser();
        UUID id = user.GetId();
        when(userRepository.GetUserById(id)).thenReturn(Optional.of(user));
        when(userRepository.DeleteUserById(id)).thenReturn(List.of("key-1", "key-2"));

        userService.DeleteUserById(id);

        verify(userRepository).DeleteUserById(id);
        verify(fileStorageService).Delete("key-1");
        verify(fileStorageService).Delete("key-2");
    }

    @Test
    void deleteUserById_withUnknownId_shouldThrowAndNotDelete() {
        UUID id = UUID.randomUUID();
        when(userRepository.GetUserById(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.DeleteUserById(id));
        verify(userRepository, never()).DeleteUserById(any());
    }

    @Test
    void searchUsers_shouldBeCaseInsensitive() {
        User user = existingUser();
        when(userRepository.GetUsers()).thenReturn(List.of(user));

        List<UserContracts.UserSearchResponse> result = userService.SearchUsers("IVAN@EXAMPLE.COM");

        assertEquals(1, result.size());
        assertEquals(user.GetId(), result.get(0).id());
    }

    private User existingUser() {
        return new User(
                UUID.randomUUID(), "Иван", "Иванов", "ivan@example.com",
                LocalDate.of(1995, 1, 1), LocalDateTime.now(),
                "hashed-password", RoleTypeEnum.Client
        );
    }

    private static String eqIgnoreCase(String expected) {
        return org.mockito.ArgumentMatchers.argThat(actual -> expected.equalsIgnoreCase(actual));
    }

    private static String sha256Hex(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
