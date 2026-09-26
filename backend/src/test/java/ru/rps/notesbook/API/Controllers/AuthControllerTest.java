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

    @Test
    void register_withBlankName_shouldThrowBadRequest() {
        AuthContracts.RegisterRequest request = new AuthContracts.RegisterRequest(
                "", "Иванов", "ivan@example.com", LocalDate.of(1995, 1, 1), "password123", "password123");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.register(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).register(any(), any(), any(), any(), any());
    }

    @Test
    void register_withBlankSurname_shouldThrowBadRequest() {
        AuthContracts.RegisterRequest request = new AuthContracts.RegisterRequest(
                "Иван", "", "ivan@example.com", LocalDate.of(1995, 1, 1), "password123", "password123");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.register(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).register(any(), any(), any(), any(), any());
    }

    @Test
    void register_withBlankEmail_shouldThrowBadRequest() {
        AuthContracts.RegisterRequest request = new AuthContracts.RegisterRequest(
                "Иван", "Иванов", "", LocalDate.of(1995, 1, 1), "password123", "password123");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.register(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).register(any(), any(), any(), any(), any());
    }

    @Test
    void register_withBlankPassword_shouldThrowBadRequest() {
        AuthContracts.RegisterRequest request = new AuthContracts.RegisterRequest(
                "Иван", "Иванов", "ivan@example.com", LocalDate.of(1995, 1, 1), "", "");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.register(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).register(any(), any(), any(), any(), any());
    }

    @Test
    void register_withMismatchedPasswordConfirm_shouldThrowBadRequest() {
        AuthContracts.RegisterRequest request = new AuthContracts.RegisterRequest(
                "Иван", "Иванов", "ivan@example.com", LocalDate.of(1995, 1, 1), "password123", "otherPassword");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.register(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).register(any(), any(), any(), any(), any());
    }

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

    @Test
    void login_withUnknownEmail_shouldThrowUnauthorized() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad credentials"));

        AuthContracts.LoginRequest request = new AuthContracts.LoginRequest("unknown@example.com", "password123");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.login(request, httpRequest, httpResponse));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    @Test
    void login_withWrongPassword_shouldThrowUnauthorized() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad credentials"));

        AuthContracts.LoginRequest request = new AuthContracts.LoginRequest("ivan@example.com", "wrongPassword");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.login(request, httpRequest, httpResponse));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    @Test
    void login_withBlankEmail_shouldThrowBadRequest() {
        AuthContracts.LoginRequest request = new AuthContracts.LoginRequest("", "password123");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.login(request, httpRequest, httpResponse));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void login_withBlankPassword_shouldThrowBadRequest() {
        AuthContracts.LoginRequest request = new AuthContracts.LoginRequest("ivan@example.com", "");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.login(request, httpRequest, httpResponse));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void forgotPassword_withBlankEmail_shouldThrowBadRequest() {
        AuthContracts.ForgotPasswordRequest request = new AuthContracts.ForgotPasswordRequest("");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.forgotPassword(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).RequestPasswordReset(any());
    }

    @Test
    void resetPassword_withMismatchedConfirmation_shouldThrowBadRequest() {
        AuthContracts.ResetPasswordRequest request =
                new AuthContracts.ResetPasswordRequest("some-token", "newPassword123", "otherPassword");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.resetPassword(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userService, never()).ResetPassword(any(), any());
    }

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
