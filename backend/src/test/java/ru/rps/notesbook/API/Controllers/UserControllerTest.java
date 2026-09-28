package ru.rps.notesbook.API.Controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.UserContracts;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Services.IUserService;
import ru.rps.notesbook.Domain.Security.NotesbookUserPrincipal;

import java.time.LocalDate;
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
class UserControllerTest {

    @Mock
    private IUserService userService;

    private UserController controller;

    private UUID selfId;
    private UUID otherId;
    private NotesbookUserPrincipal selfPrincipal;
    private NotesbookUserPrincipal adminPrincipal;

    @BeforeEach
    void setUp() {
        controller = new UserController(userService);

        selfId = UUID.randomUUID();
        otherId = UUID.randomUUID();

        selfPrincipal = new NotesbookUserPrincipal(selfId, "user@example.com", "hash",
                List.of(new SimpleGrantedAuthority("ROLE_CLIENT")));
        adminPrincipal = new NotesbookUserPrincipal(selfId, "admin@example.com", "hash",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    private UserContracts.UserResponse sampleResponse(UUID id) {
        return new UserContracts.UserResponse(id, "Имя", "Фамилия", "someone@example.com",
                LocalDate.of(1995, 1, 1), LocalDateTime.now(), RoleTypeEnum.Client);
    }

    @Test
    void listUsers_byAdmin_shouldReturnFullList() {
        UserContracts.UserPageResponse expected = new UserContracts.UserPageResponse(
                List.of(sampleResponse(selfId), sampleResponse(otherId)), null, false, 2);
        when(userService.GetUsers(null, null)).thenReturn(expected);

        UserContracts.UserPageResponse result = controller.listUsers(adminPrincipal, null, null);

        assertEquals(expected, result);
    }

    @Test
    void listUsers_byNonAdmin_shouldThrowForbidden() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.listUsers(selfPrincipal, null, null));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(userService, never()).GetUsers(any(), any());
    }

    @Test
    void getUser_ownProfile_shouldReturnData() {
        UserContracts.UserResponse expected = sampleResponse(selfId);
        when(userService.GetUserById(selfId)).thenReturn(expected);

        UserContracts.UserResponse result = controller.getUser(selfPrincipal, selfId);

        assertEquals(expected, result);
    }

    @Test
    void getUser_otherProfileByAdmin_shouldReturnData() {
        UserContracts.UserResponse expected = sampleResponse(otherId);
        when(userService.GetUserById(otherId)).thenReturn(expected);

        UserContracts.UserResponse result = controller.getUser(adminPrincipal, otherId);

        assertEquals(expected, result);
    }

    @Test
    void getUser_otherProfileByNonAdmin_shouldThrowForbidden() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.getUser(selfPrincipal, otherId));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(userService, never()).GetUserById(any());
    }

    @Test
    void updateUser_otherByAdmin_shouldDelegateToService() {
        UserContracts.UpdateUserRequest request =
                new UserContracts.UpdateUserRequest("Новое имя", null, null, null, null);
        UserContracts.UserResponse expected = sampleResponse(otherId);
        when(userService.UpdateUser(otherId, request)).thenReturn(expected);

        UserContracts.UserResponse result = controller.updateUser(adminPrincipal, otherId, request);

        assertEquals(expected, result);
    }

    @Test
    void updateUser_otherByNonAdmin_shouldThrowForbidden() {
        UserContracts.UpdateUserRequest request =
                new UserContracts.UpdateUserRequest("Новое имя", null, null, null, null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.updateUser(selfPrincipal, otherId, request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(userService, never()).UpdateUser(any(), any());
    }

    @Test
    void changeUserRole_byAdmin_shouldDelegateToService() {
        UserContracts.ChangeRoleRequest request = new UserContracts.ChangeRoleRequest(RoleTypeEnum.Admin);
        UserContracts.UserResponse expected = sampleResponse(otherId);
        when(userService.ChangeUserRole(otherId, RoleTypeEnum.Admin)).thenReturn(expected);

        UserContracts.UserResponse result = controller.changeUserRole(adminPrincipal, otherId, request);

        assertEquals(expected, result);
    }

    @Test
    void changeUserRole_byNonAdmin_shouldThrowForbidden() {
        UserContracts.ChangeRoleRequest request = new UserContracts.ChangeRoleRequest(RoleTypeEnum.Admin);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.changeUserRole(selfPrincipal, otherId, request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(userService, never()).ChangeUserRole(any(), any());
    }

    @Test
    void deleteUser_otherByAdmin_shouldDelegateToService() {
        controller.deleteUser(adminPrincipal, otherId);

        verify(userService).DeleteUserById(otherId);
    }

    @Test
    void deleteUser_ownAccountByNonAdmin_shouldDelegateToService() {
        controller.deleteUser(selfPrincipal, selfId);

        verify(userService).DeleteUserById(selfId);
    }

    @Test
    void deleteUser_otherAccountByNonAdmin_shouldThrowForbidden() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.deleteUser(selfPrincipal, otherId));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(userService, never()).DeleteUserById(any());
    }

    @Test
    void listUsers_withoutAuthentication_shouldThrowUnauthorized() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.listUsers(null, null, null));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        verify(userService, never()).GetUsers(any(), any());
    }

}
