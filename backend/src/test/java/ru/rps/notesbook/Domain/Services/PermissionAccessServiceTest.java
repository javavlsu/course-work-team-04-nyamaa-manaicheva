package ru.rps.notesbook.Domain.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.PermissionAccessContracts;
import ru.rps.notesbook.Domain.Enum.NoteTypeEnum;
import ru.rps.notesbook.Domain.Enum.PermissionTypeEnum;
import ru.rps.notesbook.Domain.Enum.RoleTypeEnum;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryNoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IDirectoryRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.INoteRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IPermissionAccessRepository;
import ru.rps.notesbook.Domain.Interfaces.Repository.IUserRepository;
import ru.rps.notesbook.Domain.Models.Note;
import ru.rps.notesbook.Domain.Models.PermissionAccess;
import ru.rps.notesbook.Domain.Models.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

/**
 * Юнит-тесты для {@link PermissionAccessService}.
 * Соответствует пунктам 56-59 чек-листа (административный модуль, "Сервис PermissionAccessService").
 * Все проверки владения ресурсом реализованы в самом сервисе — отдельный ControllerTest не нужен.
 */
@ExtendWith(MockitoExtension.class)
class PermissionAccessServiceTest {

    @Mock
    private IPermissionAccessRepository permissionAccessRepository;
    @Mock
    private INoteRepository noteRepository;
    @Mock
    private IDirectoryRepository directoryRepository;
    @Mock
    private IDirectoryNoteRepository directoryNoteRepository;
    @Mock
    private IUserRepository userRepository;

    private PermissionAccessService permissionAccessService;

    private User owner;
    private User otherUser;
    private Note note;

    @BeforeEach
    void setUp() {
        permissionAccessService = new PermissionAccessService(
                permissionAccessRepository, noteRepository, directoryRepository, directoryNoteRepository, userRepository);

        owner = new User(UUID.randomUUID(), "Иван", "Иванов", "ivan@example.com",
                LocalDate.of(1995, 1, 1), LocalDateTime.now(), "hash", RoleTypeEnum.Client);
        otherUser = new User(UUID.randomUUID(), "Пётр", "Петров", "petr@example.com",
                LocalDate.of(1996, 2, 2), LocalDateTime.now(), "hash", RoleTypeEnum.Client);
        note = new Note(UUID.randomUUID(), "Заметка", null, LocalDateTime.now(), NoteTypeEnum.Empty, false, owner);
    }

    // 56. Выдача доступа (View/Edit) к своей заметке другому пользователю
    @Test
    void grantPermission_toOwnNote_shouldCreatePermission() {
        when(noteRepository.GetNoteById(note.GetId())).thenReturn(Optional.of(note));
        when(userRepository.GetUserById(otherUser.GetId())).thenReturn(Optional.of(otherUser));
        when(permissionAccessRepository.GetPermissionAccessByUserIdAndNoteId(otherUser.GetId(), note.GetId()))
                .thenReturn(Optional.empty());
        when(permissionAccessRepository.SavePermissionAccess(any(PermissionAccess.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        PermissionAccessContracts.CreatePermissionAccessRequest request =
                new PermissionAccessContracts.CreatePermissionAccessRequest(
                        PermissionTypeEnum.View, note.GetId(), otherUser.GetId(), null);

        PermissionAccessContracts.PermissionAccessResponse response =
                permissionAccessService.GrantPermission(owner.GetId(), request);

        assertEquals(PermissionTypeEnum.View, response.type());
        assertEquals(note.GetId(), response.noteId());
        assertEquals(otherUser.GetId(), response.userId());
    }

    // 57. Выдача доступа не владельцем ресурса
    @Test
    void grantPermission_byNonOwner_shouldThrowForbidden() {
        when(noteRepository.GetNoteById(note.GetId())).thenReturn(Optional.of(note));

        PermissionAccessContracts.CreatePermissionAccessRequest request =
                new PermissionAccessContracts.CreatePermissionAccessRequest(
                        PermissionTypeEnum.View, note.GetId(), otherUser.GetId(), null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> permissionAccessService.GrantPermission(otherUser.GetId(), request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(permissionAccessRepository, never()).SavePermissionAccess(any());
    }

    // 58. Попытка выдать доступ самому себе или владельцу ресурса
    @Test
    void grantPermission_toSelf_shouldThrowBadRequest() {
        when(noteRepository.GetNoteById(note.GetId())).thenReturn(Optional.of(note));

        PermissionAccessContracts.CreatePermissionAccessRequest request =
                new PermissionAccessContracts.CreatePermissionAccessRequest(
                        PermissionTypeEnum.View, note.GetId(), owner.GetId(), null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> permissionAccessService.GrantPermission(owner.GetId(), request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(permissionAccessRepository, never()).SavePermissionAccess(any());
    }

    // 59. Отзыв доступа не владельцем ресурса
    @Test
    void revokePermission_byNonOwner_shouldThrowForbidden() {
        UUID permissionId = UUID.randomUUID();
        PermissionAccess permission = new PermissionAccess(
                permissionId, PermissionTypeEnum.View, note, otherUser, null, owner, LocalDateTime.now());
        when(permissionAccessRepository.GetPermissionAccessById(permissionId)).thenReturn(Optional.of(permission));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> permissionAccessService.RevokePermission(otherUser.GetId(), permissionId));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(permissionAccessRepository, never()).DeletePermissionAccessById(any());
    }

}
