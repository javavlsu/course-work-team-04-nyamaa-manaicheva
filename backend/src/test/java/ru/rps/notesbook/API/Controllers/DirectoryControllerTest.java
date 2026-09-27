package ru.rps.notesbook.API.Controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.DirectoryContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryNoteService;
import ru.rps.notesbook.Domain.Interfaces.Services.IDirectoryService;
import ru.rps.notesbook.Domain.Interfaces.Services.INoteService;
import ru.rps.notesbook.Domain.Interfaces.Services.IPermissionAccessService;
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
class DirectoryControllerTest {

    @Mock
    private IDirectoryService directoryService;
    @Mock
    private INoteService noteService;
    @Mock
    private IDirectoryNoteService directoryNoteService;
    @Mock
    private IPermissionAccessService permissionAccessService;

    private DirectoryController controller;

    @BeforeEach
    void setUp() {
        controller = new DirectoryController(directoryService, noteService, directoryNoteService, permissionAccessService);
    }

    @Test
    void deleteDirectoryById_byNonOwner_shouldThrowForbidden() {
        UUID directoryId = UUID.randomUUID();
        UUID actualOwnerId = UUID.randomUUID();
        UUID currentUserId = UUID.randomUUID();

        NotesbookUserPrincipal principal =
                new NotesbookUserPrincipal(currentUserId, "someone@example.com", "hash", List.of());

        DirectoryContracts.DirectoryResponse response = new DirectoryContracts.DirectoryResponse(
                directoryId, "Чужая папка", LocalDateTime.now(), actualOwnerId, LocalDateTime.now(), null, 1L
        );
        when(directoryService.GetDirectoryById(directoryId)).thenReturn(response);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.deleteDirectoryById(principal, directoryId));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(directoryService, never()).DeleteDirectoryById(any());
    }

}
