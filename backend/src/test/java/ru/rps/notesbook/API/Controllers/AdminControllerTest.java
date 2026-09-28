package ru.rps.notesbook.API.Controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.AdminContracts;
import ru.rps.notesbook.API.Contracts.UserContracts;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Services.IAdminService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private IAdminService adminService;

    private AdminController controller;

    private UUID adminId;
    private UUID otherId;
    private NotesbookUserPrincipal adminPrincipal;
    private NotesbookUserPrincipal clientPrincipal;

    @BeforeEach
    void setUp() {
        controller = new AdminController(adminService);

        adminId = UUID.randomUUID();
        otherId = UUID.randomUUID();

        adminPrincipal = new NotesbookUserPrincipal(adminId, "admin@example.com", "hash",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        clientPrincipal = new NotesbookUserPrincipal(UUID.randomUUID(), "user@example.com", "hash",
                List.of(new SimpleGrantedAuthority("ROLE_CLIENT")));
    }

    private UserContracts.CreateUserRequest sampleRequest() {
        return new UserContracts.CreateUserRequest(
                "Иван", "Иванов", "ivan@example.com", null, "password123", RoleTypeEnum.Admin);
    }

    @Test
    void createUser_byAdmin_shouldReturnCreated() {
        UserContracts.CreateUserRequest request = sampleRequest();
        UserContracts.UserResponse expected = new UserContracts.UserResponse(
                otherId, "Иван", "Иванов", "ivan@example.com", null, LocalDateTime.now(), RoleTypeEnum.Admin);
        when(adminService.CreateUser(request)).thenReturn(expected);

        ResponseEntity<UserContracts.UserResponse> result = controller.createUser(adminPrincipal, request);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertEquals(expected, result.getBody());
    }

    @Test
    void createUser_withInvalidData_shouldThrowBadRequest() {
        UserContracts.CreateUserRequest request = sampleRequest();
        when(adminService.CreateUser(request)).thenThrow(new IllegalArgumentException("Укажите имя"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.createUser(adminPrincipal, request));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Укажите имя", ex.getReason());
    }

    @Test
    void createUser_byClient_shouldThrowForbidden() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.createUser(clientPrincipal, sampleRequest()));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(adminService, never()).CreateUser(any());
    }

    @Test
    void deleteUser_byAdmin_shouldDelegateWithActorId() {
        ResponseEntity<Void> result = controller.deleteUser(adminPrincipal, otherId);

        assertEquals(HttpStatus.NO_CONTENT, result.getStatusCode());
        verify(adminService).DeleteUserWithAllData(otherId, adminId);
    }

    @Test
    void deleteUser_byClient_shouldThrowForbidden() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.deleteUser(clientPrincipal, otherId));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(adminService, never()).DeleteUserWithAllData(any(), any());
    }

    @Test
    void getLogs_byAdmin_shouldReturnLogs() {
        AdminContracts.LogsResponse expected = new AdminContracts.LogsResponse(true, "line");
        when(adminService.GetLogs(100)).thenReturn(expected);

        assertEquals(expected, controller.getLogs(adminPrincipal, 100));
    }

    @Test
    void getLogs_byClient_shouldThrowForbidden() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.getLogs(clientPrincipal, null));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(adminService, never()).GetLogs(any());
    }

    @Test
    void getLogs_withoutAuthentication_shouldThrowUnauthorized() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.getLogs(null, null));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        verify(adminService, never()).GetLogs(any());
    }

}
