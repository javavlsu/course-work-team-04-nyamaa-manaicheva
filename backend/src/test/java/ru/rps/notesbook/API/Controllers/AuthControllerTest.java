package ru.rps.notesbook.API.Controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.AuthContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.IUserService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Юнит-тесты для {@link AuthController}.
 * Соответствует пунктам 2-6, 11-15, 18, 22-23 чек-листа (административный модуль,
 * раздел "Сервис AuthService") — проверки пустых/несовпадающих полей и сам вход в систему
 * реализованы здесь, а не в UserService (см. UserServiceTest для остальных пунктов Auth-блока).
 */
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private IUserService userService;
    @Mock
    private AuthenticationManager authenticationManager;

    private AuthController controller;

    private MockHttpServletRequest httpRequest;
    private MockHttpServletResponse httpResponse;

    @BeforeEach
    void setUp() {
        controller = new AuthController(userService, authenticationManager);
        httpRequest = new MockHttpServletRequest();
        httpResponse = new MockHttpServletResponse();
    }

    private AuthContracts.RegisterRequest validRegisterRequest() {
        return new AuthContracts.RegisterRequest(
                "Иван", "Иванов", "ivan@example.com",
                LocalDate.of(1995, 1, 1), "password123", "password123");
    }

    // 2. Регистрация с пустым именем
    @Test
    void register_withBlankName_shouldThrowBadRequest() {
        AuthContracts.RegisterRequest request = new AuthContracts.RegisterRequest(
                "", "Иванов", "ivan@example.com", LocalDate.of(1995, 1, 1), "password123", "password123");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.register(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).register(any(), any(), any(), any(), any());
    }

    // 3. Регистрация с пустой фамилией
    @Test
    void register_withBlankSurname_shouldThrowBadRequest() {
        AuthContracts.RegisterRequest request = new AuthContracts.RegisterRequest(
                "Иван", "", "ivan@example.com", LocalDate.of(1995, 1, 1), "password123", "password123");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.register(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).register(any(), any(), any(), any(), any());
    }

    // 4. Регистрация с пустым email
    @Test
    void register_withBlankEmail_shouldThrowBadRequest() {
        AuthContracts.RegisterRequest request = new AuthContracts.RegisterRequest(
                "Иван", "Иванов", "", LocalDate.of(1995, 1, 1), "password123", "password123");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.register(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).register(any(), any(), any(), any(), any());
    }

    // 5. Регистрация с пустым паролем
    @Test
    void register_withBlankPassword_shouldThrowBadRequest() {
        AuthContracts.RegisterRequest request = new AuthContracts.RegisterRequest(
                "Иван", "Иванов", "ivan@example.com", LocalDate.of(1995, 1, 1), "", "");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.register(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).register(any(), any(), any(), any(), any());
    }

    // 6. Регистрация с несовпадающими паролем и подтверждением
    @Test
    void register_withMismatchedPasswordConfirm_shouldThrowBadRequest() {
        AuthContracts.RegisterRequest request = new AuthContracts.RegisterRequest(
                "Иван", "Иванов", "ivan@example.com", LocalDate.of(1995, 1, 1), "password123", "otherPassword");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.register(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).register(any(), any(), any(), any(), any());
    }

    // 11. Успешный вход с верными email и паролем
    @Test
    void login_withValidCredentials_shouldReturnUserIdAndEmail() {
        UUID userId = UUID.randomUUID();
        NotesbookUserPrincipal principal =
                new NotesbookUserPrincipal(userId, "ivan@example.com", "hash", List.of());
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);
        when(authenticationManager.authenticate(any())).thenReturn(authentication);

        AuthContracts.LoginRequest request = new AuthContracts.LoginRequest("ivan@example.com", "password123");

        ResponseEntity<AuthContracts.LoginResponse> response = controller.login(request, httpRequest, httpResponse);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(userId, response.getBody().userId());
        assertEquals("ivan@example.com", response.getBody().email());
    }

    // 12. Вход с несуществующим email
    @Test
    void login_withUnknownEmail_shouldThrowUnauthorized() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad credentials"));

        AuthContracts.LoginRequest request = new AuthContracts.LoginRequest("unknown@example.com", "password123");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.login(request, httpRequest, httpResponse));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    // 13. Вход с неверным паролем
    @Test
    void login_withWrongPassword_shouldThrowUnauthorized() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad credentials"));

        AuthContracts.LoginRequest request = new AuthContracts.LoginRequest("ivan@example.com", "wrongPassword");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.login(request, httpRequest, httpResponse));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    // 14. Вход с пустым email
    @Test
    void login_withBlankEmail_shouldThrowBadRequest() {
        AuthContracts.LoginRequest request = new AuthContracts.LoginRequest("", "password123");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.login(request, httpRequest, httpResponse));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(authenticationManager, never()).authenticate(any());
    }

    // 15. Вход с пустым паролем
    @Test
    void login_withBlankPassword_shouldThrowBadRequest() {
        AuthContracts.LoginRequest request = new AuthContracts.LoginRequest("ivan@example.com", "");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.login(request, httpRequest, httpResponse));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(authenticationManager, never()).authenticate(any());
    }

    // 18. Запрос восстановления пароля с пустым email
    @Test
    void forgotPassword_withBlankEmail_shouldThrowBadRequest() {
        AuthContracts.ForgotPasswordRequest request = new AuthContracts.ForgotPasswordRequest("");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.forgotPassword(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).RequestPasswordReset(any());
    }

    // 22. Сброс пароля с несовпадающими новым паролем и подтверждением
    @Test
    void resetPassword_withMismatchedConfirmation_shouldThrowBadRequest() {
        AuthContracts.ResetPasswordRequest request =
                new AuthContracts.ResetPasswordRequest("some-token", "newPassword123", "otherPassword");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.resetPassword(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).ResetPassword(any(), any());
    }

    // 23. Сброс пароля с пустым токеном
    @Test
    void resetPassword_withBlankToken_shouldThrowBadRequest() {
        AuthContracts.ResetPasswordRequest request =
                new AuthContracts.ResetPasswordRequest("", "newPassword123", "newPassword123");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.resetPassword(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).ResetPassword(any(), any());
    }

}
