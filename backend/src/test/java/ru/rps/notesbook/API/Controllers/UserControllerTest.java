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

/**
 * Юнит-тесты для {@link UserController}.
 * Соответствует пунктам 24-25, 28-30, 33-34, 38-39, 42-44, 49 чек-листа (административный
 * модуль, раздел "Сервис UserService") — то есть тем проверкам, которые реализованы через
 * requireAdmin/requireSelfOrAdmin в самом контроллере, а не в UserService (см. UserServiceTest
 * для остальных пунктов этого раздела).
 */
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

    // 24. Получение списка всех пользователей администратором
    @Test
    void listUsers_byAdmin_shouldReturnFullList() {
        List<UserContracts.UserResponse> expected = List.of(sampleResponse(selfId), sampleResponse(otherId));
        when(userService.GetUsers()).thenReturn(expected);

        List<UserContracts.UserResponse> result = controller.listUsers(adminPrincipal);

        assertEquals(expected, result);
    }

    // 25. Получение списка всех пользователей обычным пользователем
    @Test
    void listUsers_byNonAdmin_shouldThrowForbidden() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.listUsers(selfPrincipal));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(userService, never()).GetUsers();
    }

    // 28. Получение собственного профиля
    @Test
    void getUser_ownProfile_shouldReturnData() {
        UserContracts.UserResponse expected = sampleResponse(selfId);
        when(userService.GetUserById(selfId)).thenReturn(expected);

        UserContracts.UserResponse result = controller.getUser(selfPrincipal, selfId);

        assertEquals(expected, result);
    }

    // 29. Получение профиля другого пользователя администратором
    @Test
    void getUser_otherProfileByAdmin_shouldReturnData() {
        UserContracts.UserResponse expected = sampleResponse(otherId);
        when(userService.GetUserById(otherId)).thenReturn(expected);

        UserContracts.UserResponse result = controller.getUser(adminPrincipal, otherId);

        assertEquals(expected, result);
    }

    // 30. Получение профиля другого пользователя обычным пользователем
    @Test
    void getUser_otherProfileByNonAdmin_shouldThrowForbidden() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.getUser(selfPrincipal, otherId));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(userService, never()).GetUserById(any());
    }

    // 33. Обновление данных другого пользователя администратором
    @Test
    void updateUser_otherByAdmin_shouldDelegateToService() {
        UserContracts.UpdateUserRequest request =
                new UserContracts.UpdateUserRequest("Новое имя", null, null, null, null);
        UserContracts.UserResponse expected = sampleResponse(otherId);
        when(userService.UpdateUser(otherId, request)).thenReturn(expected);

        UserContracts.UserResponse result = controller.updateUser(adminPrincipal, otherId, request);

        assertEquals(expected, result);
    }

    // 34. Обновление данных другого пользователя обычным пользователем
    @Test
    void updateUser_otherByNonAdmin_shouldThrowForbidden() {
        UserContracts.UpdateUserRequest request =
                new UserContracts.UpdateUserRequest("Новое имя", null, null, null, null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.updateUser(selfPrincipal, otherId, request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(userService, never()).UpdateUser(any(), any());
    }

    // 38. Изменение роли пользователя администратором
    @Test
    void changeUserRole_byAdmin_shouldDelegateToService() {
        UserContracts.ChangeRoleRequest request = new UserContracts.ChangeRoleRequest(RoleTypeEnum.Admin);
        UserContracts.UserResponse expected = sampleResponse(otherId);
        when(userService.ChangeUserRole(otherId, RoleTypeEnum.Admin)).thenReturn(expected);

        UserContracts.UserResponse result = controller.changeUserRole(adminPrincipal, otherId, request);

        assertEquals(expected, result);
    }

    // 39. Изменение роли пользователя обычным пользователем
    @Test
    void changeUserRole_byNonAdmin_shouldThrowForbidden() {
        UserContracts.ChangeRoleRequest request = new UserContracts.ChangeRoleRequest(RoleTypeEnum.Admin);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.changeUserRole(selfPrincipal, otherId, request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(userService, never()).ChangeUserRole(any(), any());
    }

    // 42. Удаление другого пользователя администратором
    @Test
    void deleteUser_otherByAdmin_shouldDelegateToService() {
        controller.deleteUser(adminPrincipal, otherId);

        verify(userService).DeleteUserById(otherId);
    }

    // 43. Удаление собственного аккаунта пользователем
    @Test
    void deleteUser_ownAccountByNonAdmin_shouldDelegateToService() {
        controller.deleteUser(selfPrincipal, selfId);

        verify(userService).DeleteUserById(selfId);
    }

    // 44. Удаление чужого аккаунта обычным пользователем
    @Test
    void deleteUser_otherAccountByNonAdmin_shouldThrowForbidden() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.deleteUser(selfPrincipal, otherId));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(userService, never()).DeleteUserById(any());
    }

    // 49. Обращение к списку пользователей без аутентификации
    @Test
    void listUsers_withoutAuthentication_shouldThrowUnauthorized() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.listUsers(null));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        verify(userService, never()).GetUsers();
    }

}
